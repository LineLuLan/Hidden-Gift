/**
 * @file lib/countdowns/actions.ts
 * @description Server Actions for countdowns. Free tier capped at 1 per user.
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { countCountdowns } from "@/lib/countdowns/queries";
import { countdownIdSchema, countdownInputSchema } from "@/lib/countdowns/schema";
import { getLimits } from "@/lib/subscription/limits";
import { createClient } from "@/lib/supabase/server";

export interface CountdownActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  countdownId?: string;
}

export async function createCountdown(
  _prev: CountdownActionResult | null,
  formData: FormData,
): Promise<CountdownActionResult> {
  const parsed = countdownInputSchema.safeParse({
    title: formData.get("title"),
    targetDate: formData.get("targetDate"),
    isRecurring: formData.get("isRecurring") === "on" || formData.get("isRecurring") === "true",
    emoji: formData.get("emoji"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const account = await requireAccount();

  const limits = await getLimits(user.id);
  const count = await countCountdowns(user.id);
  if (count >= limits.countdowns) {
    return {
      ok: false,
      error: `Đã đạt giới hạn ${limits.countdowns} countdown ở Free tier. Lên Pro để không giới hạn ⏳`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("countdowns")
    .insert({
      account_id: account.accountId,
      created_by: user.id,
      title: parsed.data.title,
      target_date: parsed.data.targetDate,
      is_recurring: parsed.data.isRecurring,
      emoji: parsed.data.emoji ?? null,
      note: parsed.data.note ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: `Không lưu được: ${error.message}` };

  revalidatePath("/countdowns");
  revalidatePath("/");
  return { ok: true, countdownId: (data as { id: string }).id };
}

export async function updateCountdown(
  id: string,
  _prev: CountdownActionResult | null,
  formData: FormData,
): Promise<CountdownActionResult> {
  const idParsed = countdownIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID không hợp lệ" };

  const parsed = countdownInputSchema.safeParse({
    title: formData.get("title"),
    targetDate: formData.get("targetDate"),
    isRecurring: formData.get("isRecurring") === "on" || formData.get("isRecurring") === "true",
    emoji: formData.get("emoji"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("countdowns")
    .update({
      title: parsed.data.title,
      target_date: parsed.data.targetDate,
      is_recurring: parsed.data.isRecurring,
      emoji: parsed.data.emoji ?? null,
      note: parsed.data.note ?? null,
    })
    .eq("id", idParsed.data);

  if (error) return { ok: false, error: `Không cập nhật được: ${error.message}` };
  revalidatePath("/countdowns");
  revalidatePath(`/countdowns/${idParsed.data}/edit`);
  revalidatePath("/");
  return { ok: true, countdownId: idParsed.data };
}

export async function deleteCountdown(id: string): Promise<CountdownActionResult> {
  const idParsed = countdownIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID không hợp lệ" };

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("countdowns").delete().eq("id", idParsed.data);

  if (error) return { ok: false, error: `Không xoá được: ${error.message}` };
  revalidatePath("/countdowns");
  revalidatePath("/");
  return { ok: true };
}
