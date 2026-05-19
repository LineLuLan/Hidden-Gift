import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

test("login -> dashboard -> wishes CRUD", async ({ page }) => {
  // Pre-create confirmed user via admin
  const tag = Date.now();
  const email = `pw-${tag}@example.com`;
  const password = "TestPass123!";
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "Playwright Tester" },
  });
  if (error) throw error;
  const userId = created.user.id;

  try {
    // Login via the actual form
    await page.goto("http://localhost:3000/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]:has-text("Đăng nhập")');

    // Should land on dashboard
    await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
    await expect(page.getByText("ơi 💝")).toBeVisible();

    // Navigate to wishes
    await page.goto("http://localhost:3000/wishes");
    await expect(page.getByRole("heading", { name: "Điều ước của bạn" })).toBeVisible();

    // Create a wish
    await page.click('a:has-text("Tạo điều ước")');
    await page.waitForURL("**/wishes/new");
    await page.fill('input[name="title"]', "Playwright smoke wish");
    await page.fill('textarea[name="description"]', "Created by automated test");
    await page.fill('input[name="emoji"]', "🤖");
    await page.click('button[type="submit"]:has-text("Tạo điều ước")');

    // Back on /wishes, see the wish
    await page.waitForURL("**/wishes");
    await expect(page.getByText("Playwright smoke wish")).toBeVisible();
    await expect(page.getByText("🤖")).toBeVisible();

    // Settings should show solo (no partner yet) — title in CardTitle div
    await page.goto("http://localhost:3000/settings");
    await expect(page.getByText("Mời partner", { exact: true })).toBeVisible();
  } finally {
    await admin.auth.admin.deleteUser(userId);
  }
});

test("invite + secret asymmetric visibility", async ({ browser }) => {
  const tag = Date.now();
  const passwd = "TestPass123!";
  const aliceEmail = `pw-a-${tag}@example.com`;
  const bobEmail = `pw-b-${tag}@example.com`;

  const { data: alice } = await admin.auth.admin.createUser({
    email: aliceEmail,
    password: passwd,
    email_confirm: true,
    user_metadata: { display_name: "Alice" },
  });
  const { data: bob } = await admin.auth.admin.createUser({
    email: bobEmail,
    password: passwd,
    email_confirm: true,
    user_metadata: { display_name: "Bob" },
  });

  const aliceCtx = await browser.newContext();
  const bobCtx = await browser.newContext();
  const alicePage = await aliceCtx.newPage();
  const bobPage = await bobCtx.newPage();

  try {
    // Alice login
    await alicePage.goto("http://localhost:3000/login");
    await alicePage.fill('input[name="email"]', aliceEmail);
    await alicePage.fill('input[name="password"]', passwd);
    await alicePage.click('button[type="submit"]:has-text("Đăng nhập")');
    await alicePage.waitForURL("http://localhost:3000/", { timeout: 10000 });

    // Alice generates invite code
    await alicePage.goto("http://localhost:3000/settings");
    const genBtn = alicePage.getByRole("button", { name: "Tạo mã mời" });
    await genBtn.waitFor({ state: "visible" });
    await genBtn.click();
    const codeLocator = alicePage.locator("p.font-mono").first();
    await expect(codeLocator).toBeVisible({ timeout: 10000 });
    const code = (await codeLocator.textContent()) ?? "";
    expect(code.trim().length).toBeGreaterThanOrEqual(6);

    // Bob login + accept invite
    await bobPage.goto("http://localhost:3000/login");
    await bobPage.fill('input[name="email"]', bobEmail);
    await bobPage.fill('input[name="password"]', passwd);
    await bobPage.click('button[type="submit"]:has-text("Đăng nhập")');
    await bobPage.waitForURL("http://localhost:3000/", { timeout: 10000 });

    await bobPage.goto(`http://localhost:3000/invite/${code.trim()}`);
    await expect(bobPage.getByText("Lời mời từ Alice")).toBeVisible();
    await bobPage.click('button:has-text("Nhận lời mời")');
    await bobPage.waitForURL("http://localhost:3000/", { timeout: 10000 });

    // Verify settings now shows 2 members
    await bobPage.goto("http://localhost:3000/settings");
    await expect(bobPage.getByText("Đã liên kết partner")).toBeVisible();

    // Alice creates secret for Bob
    await alicePage.goto("http://localhost:3000/secrets/new");
    await alicePage.fill('input[name="title"]', "Surprise for Bob");
    await alicePage.fill('textarea[name="description"]', "Hidden until delivered");
    await alicePage.click('button[type="submit"]:has-text("Lưu bí mật")');
    await alicePage.waitForURL("**/secrets");
    await expect(alicePage.getByText("Surprise for Bob")).toBeVisible();

    // Bob should NOT see it
    await bobPage.goto("http://localhost:3000/secrets");
    await expect(bobPage.getByText("Surprise for Bob")).not.toBeVisible({
      timeout: 3000,
    });

    // Alice marks ready then delivers
    await alicePage.click('button:has-text("Đánh dấu Sẵn sàng")');
    await alicePage.waitForTimeout(500);
    alicePage.on("dialog", (dialog) => dialog.accept());
    await alicePage.click('button:has-text("Tặng ngay")');
    await alicePage.waitForTimeout(1000);

    // Bob now sees it
    await bobPage.reload();
    await expect(bobPage.getByText("Surprise for Bob")).toBeVisible({ timeout: 5000 });
  } finally {
    if (alice.user) await admin.auth.admin.deleteUser(alice.user.id);
    if (bob.user) await admin.auth.admin.deleteUser(bob.user.id);
    await aliceCtx.close();
    await bobCtx.close();
  }
});
