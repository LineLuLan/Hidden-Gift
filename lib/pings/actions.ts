/**
 * @file lib/pings/actions.ts
 * @description Send emoji ping + mark as read. RLS: sender always sees, recipient sees + can update read_at.
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { getAccountDetail, getPartner, isPartnerLinked } from "@/lib/account/queries";
import { pingIdSchema, pingInputSchema } from "@/lib/pings/schema";
import { z } from "zod";

export interface PingActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  pingId?: string;
}

export async function sendPing(formData: FormData): Promise<PingActionResult> {
  const parsed = pingInputSchema.safeParse({
    emoji: formData.get("emoji"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const recipientFromForm = formData.get("recipientId");
  const recipientParsed = z
    .string()
    .uuid()
    .optional()
    .safeParse(
      typeof recipientFromForm === "string" && recipientFromForm.length > 0
        ? recipientFromForm
        : undefined,
    );

  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);
  if (!detail || !isPartnerLinked(detail)) {
    return { ok: false, error: "Cần ít nhất 1 người khác để gửi ping" };
  }

  // Resolve recipient: explicit form value (squad/family) OR fallback partner (couple)
  let recipientId: string | null = recipientParsed.success ? (recipientParsed.data ?? null) : null;
  if (recipientId) {
    const valid = detail.members.some((m) => m.user_id === recipientId && m.user_id !== user.id);
    if (!valid) recipientId = null;
  }
  if (!recipientId) {
    const partner = getPartner(detail, user.id);
    if (!partner) return { ok: false, error: "Không tìm thấy người nhận" };
    recipientId = partner.user_id;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emoji_pings")
    .insert({
      account_id: account.accountId,
      sender_id: user.id,
      recipient_id: recipientId,
      emoji: parsed.data.emoji,
      message: parsed.data.message ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: `Không gửi được: ${error.message}` };

  revalidatePath("/pings");
  return { ok: true, pingId: data.id as string };
}

export async function markPingRead(id: string): Promise<PingActionResult> {
  const idParsed = pingIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID không hợp lệ" };

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("emoji_pings")
    .update({ read_at: new Date().toISOString() })
    .eq("id", idParsed.data);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/pings");
  return { ok: true };
}

export async function markAllPingsRead(): Promise<PingActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("emoji_pings")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/pings");
  return { ok: true };
}
