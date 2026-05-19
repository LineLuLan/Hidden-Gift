/**
 * @file lib/account/actions.ts
 * @description Server Actions: generate/rotate invite code, accept invite.
 *              Atomic acceptance lives in Postgres function accept_invite (migration 006).
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export interface AccountActionResult {
  ok: boolean;
  error?: string;
  code?: string;
  accountId?: string;
}

// Code alphabet excludes ambiguous chars (I, O, 0, 1) to reduce typo rate.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 8): string {
  let out = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return out;
}

/** Owner-only. Generates a new 8-char invite code and stores it on the account. */
export async function generateInviteCode(): Promise<AccountActionResult> {
  const account = await requireAccount();
  if (account.role !== "owner") {
    return { ok: false, error: "Chỉ chủ tài khoản tạo được mã mời" };
  }

  const supabase = await createClient();
  let attempts = 0;
  while (attempts < 5) {
    const code = generateCode(8);
    const { data, error } = await supabase.rpc("rotate_invite_code", {
      p_account_id: account.accountId,
      p_new_code: code,
    });
    if (!error && data) {
      revalidatePath("/settings");
      return { ok: true, code };
    }
    if (error?.message.includes("ACCOUNT_FULL")) {
      return { ok: false, error: "Đã có partner — không cần mời thêm" };
    }
    if (error?.message.includes("NOT_OWNER")) {
      return { ok: false, error: "Chỉ chủ tài khoản tạo được mã mời" };
    }
    if (error?.message.includes("duplicate")) {
      attempts += 1;
      continue;
    }
    return { ok: false, error: `Không tạo được mã: ${error?.message ?? "unknown"}` };
  }
  return { ok: false, error: "Không tạo được mã sau 5 lần thử — báo BE Lead" };
}

/** Logged-in user accepts a partner invite code. */
export async function acceptInvite(code: string): Promise<AccountActionResult> {
  await requireUser();
  if (!code || code.trim().length === 0) {
    return { ok: false, error: "Vui lòng nhập mã mời" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_invite", {
    p_code: code.trim().toUpperCase(),
  });

  if (error) {
    const message = mapInviteError(error.message);
    return { ok: false, error: message };
  }

  revalidatePath("/", "layout");
  const first = Array.isArray(data) ? data[0] : data;
  return {
    ok: true,
    accountId: (first as { joined_account_id?: string } | null)?.joined_account_id,
  };
}

/** Update caller's display_name in their account_members row. */
export async function updateProfile(
  _prev: AccountActionResult | null,
  formData: FormData,
): Promise<AccountActionResult> {
  const raw = formData.get("displayName");
  const displayName = typeof raw === "string" ? raw.trim() : "";
  if (displayName.length < 1) {
    return { ok: false, error: "Vui lòng nhập tên hiển thị" };
  }
  if (displayName.length > 50) {
    return { ok: false, error: "Tên tối đa 50 ký tự" };
  }

  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const { error } = await supabase
    .from("account_members")
    .update({ display_name: displayName })
    .eq("account_id", account.accountId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: `Không lưu được: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { ok: true };
}

function mapInviteError(raw: string): string {
  if (raw.includes("NOT_AUTHENTICATED")) return "Bạn cần đăng nhập trước";
  if (raw.includes("INVITE_NOT_FOUND")) return "Mã mời không tồn tại hoặc đã hết hạn";
  if (raw.includes("ALREADY_MEMBER")) return "Bạn đã ở trong tài khoản này";
  if (raw.includes("ACCOUNT_FULL")) return "Tài khoản đã đủ thành viên";
  return raw;
}
