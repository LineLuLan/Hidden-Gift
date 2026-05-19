/**
 * @file lib/letters/actions.ts
 * @description Save draft, schedule, manual-deliver, delete letters.
 *              Trigger.dev cron job (when configured) marks delivered automatically;
 *              this server action allows sender to deliver immediately as fallback.
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { letterIdSchema, letterInputSchema } from "@/lib/letters/schema";

export interface LetterActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  letterId?: string;
}

function bodyJson(text: string) {
  return { type: "text", content: text };
}

export async function saveLetter(
  letterId: string | null,
  _prev: LetterActionResult | null,
  formData: FormData,
): Promise<LetterActionResult> {
  const parsed = letterInputSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
    scheduledFor: formData.get("scheduledFor"),
    recipientId: formData.get("recipientId"),
    isDraft: formData.get("isDraft") ?? "true",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const account = await requireAccount();
  if (parsed.data.recipientId === user.id) {
    return { ok: false, error: "Không thể gửi thư cho chính mình" };
  }

  const supabase = await createClient();

  if (letterId) {
    const idParsed = letterIdSchema.safeParse(letterId);
    if (!idParsed.success) return { ok: false, error: "ID thư không hợp lệ" };
    const { error } = await supabase
      .from("letters")
      .update({
        subject: parsed.data.subject,
        body: bodyJson(parsed.data.body),
        scheduled_for: parsed.data.scheduledFor,
        is_draft: parsed.data.isDraft,
      })
      .eq("id", idParsed.data);
    if (error) return { ok: false, error: `Không cập nhật được: ${error.message}` };
    revalidatePath("/letters");
    revalidatePath(`/letters/${idParsed.data}`);
    return { ok: true, letterId: idParsed.data };
  }

  const { data, error } = await supabase
    .from("letters")
    .insert({
      account_id: account.accountId,
      sender_id: user.id,
      recipient_id: parsed.data.recipientId,
      subject: parsed.data.subject,
      body: bodyJson(parsed.data.body),
      scheduled_for: parsed.data.scheduledFor,
      is_draft: parsed.data.isDraft,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: `Không lưu được: ${error.message}` };

  revalidatePath("/letters");
  return { ok: true, letterId: data.id as string };
}

/** Manually flip a non-draft, undelivered letter to delivered=now. */
export async function deliverLetterNow(id: string): Promise<LetterActionResult> {
  const idParsed = letterIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID thư không hợp lệ" };
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("letters")
    .update({ delivered_at: new Date().toISOString(), is_draft: false })
    .eq("id", idParsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/letters");
  revalidatePath(`/letters/${idParsed.data}`);
  return { ok: true };
}

export async function deleteLetter(id: string): Promise<LetterActionResult> {
  const idParsed = letterIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID thư không hợp lệ" };
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("letters").delete().eq("id", idParsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/letters");
  return { ok: true };
}
