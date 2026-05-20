/**
 * @file lib/crush/actions.ts
 * @description Server Actions for solo crush profile + diary.
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { crushProfileSchema, diaryEntrySchema, diaryIdSchema } from "@/lib/crush/schema";

export interface CrushActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  crushId?: string;
}

/**
 * Upsert the caller's crush profile. Also flips account.kind to 'solo' so the
 * dashboard switches into Solo variant.
 */
export async function saveCrushProfile(
  _prev: CrushActionResult | null,
  formData: FormData,
): Promise<CrushActionResult> {
  const parsed = crushProfileSchema.safeParse({
    nickname: formData.get("nickname"),
    bio: formData.get("bio"),
    emoji: formData.get("emoji"),
    metAt: formData.get("metAt"),
    countdownLabel: formData.get("countdownLabel"),
    countdownTo: formData.get("countdownTo"),
    status: formData.get("status") ?? "crushing",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const payload = {
    account_id: account.accountId,
    user_id: user.id,
    nickname: parsed.data.nickname,
    bio: parsed.data.bio ?? null,
    emoji: parsed.data.emoji ?? null,
    met_at: parsed.data.metAt ?? null,
    countdown_label: parsed.data.countdownLabel ?? null,
    countdown_to: parsed.data.countdownTo ?? null,
    status: parsed.data.status,
  };

  const { data, error } = await supabase
    .from("crushes")
    .upsert(payload, { onConflict: "account_id,user_id" })
    .select("id")
    .single();
  if (error) return { ok: false, error: `Không lưu được: ${error.message}` };

  // Flip account.kind to solo so dashboard adapts. Idempotent.
  await supabase.from("accounts").update({ kind: "solo" }).eq("id", account.accountId);

  revalidatePath("/", "layout");
  revalidatePath("/crush");
  return { ok: true, crushId: data.id as string };
}

export async function deleteCrush(): Promise<CrushActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("crushes").delete().eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/crush");
  return { ok: true };
}

/** Switch account back to couple kind. */
export async function switchToCoupleMode(): Promise<CrushActionResult> {
  await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ kind: "couple" })
    .eq("id", account.accountId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addDiaryEntry(
  _prev: CrushActionResult | null,
  formData: FormData,
): Promise<CrushActionResult> {
  const parsed = diaryEntrySchema.safeParse({
    content: formData.get("content"),
    mood: formData.get("mood"),
    entryDate: formData.get("entryDate"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const { error } = await supabase.from("crush_diary").insert({
    account_id: account.accountId,
    user_id: user.id,
    content: parsed.data.content,
    mood: parsed.data.mood ?? null,
    entry_date: parsed.data.entryDate ?? new Date().toISOString().slice(0, 10),
  });
  if (error) return { ok: false, error: `Không lưu được: ${error.message}` };

  revalidatePath("/crush");
  return { ok: true };
}

export async function deleteDiaryEntry(id: string): Promise<CrushActionResult> {
  const parsed = diaryIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "ID không hợp lệ" };
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("crush_diary").delete().eq("id", parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/crush");
  return { ok: true };
}

/**
 * Mark caller's account as onboarded — middleware stops nudging to /onboarding.
 * Also seeds 3 sample wishes if the user has none yet (Free activation boost).
 */
export async function markOnboarded(
  preferredKind: "solo" | "couple" = "couple",
): Promise<CrushActionResult> {
  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({
      kind: preferredKind,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", account.accountId);
  if (error) return { ok: false, error: error.message };

  // Seed 3 sample wishes if user has none. Skip silently on failure — not critical.
  const { count } = await supabase
    .from("wishes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) === 0) {
    const samples = [
      {
        account_id: account.accountId,
        user_id: user.id,
        title: "Một buổi sáng có hoa",
        emoji: "🌷",
        description: "Cảm giác được tặng hoa bất ngờ buổi sáng — kiểu rất nhẹ và rất đẹp.",
      },
      {
        account_id: account.accountId,
        user_id: user.id,
        title: "Bữa tối yên tĩnh ở Hồ Tây",
        emoji: "🍣",
        description: "Một nhà hàng nhỏ, view hồ, không quá ồn — chỉ tụi mình.",
      },
      {
        account_id: account.accountId,
        user_id: user.id,
        title: "Một quyển sách đang muốn đọc",
        emoji: "📚",
        description: "Có thể là Atomic Habits, hoặc bất kỳ cuốn nào bạn nghĩ mình sẽ thích.",
      },
    ];
    await supabase.from("wishes").insert(samples);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
