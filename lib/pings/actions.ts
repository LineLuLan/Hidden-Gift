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

  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);
  if (!detail || !isPartnerLinked(detail)) {
    return { ok: false, error: "Cần partner trước khi gửi ping" };
  }
  const partner = getPartner(detail, user.id);
  if (!partner) return { ok: false, error: "Không tìm thấy partner" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emoji_pings")
    .insert({
      account_id: account.accountId,
      sender_id: user.id,
      recipient_id: partner.user_id,
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
