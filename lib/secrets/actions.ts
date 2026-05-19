/**
 * @file lib/secrets/actions.ts
 * @description Server Actions: prepareSecret, updateSecret, markDelivered, deleteSecret.
 *              RLS enforces asymmetric visibility — recipient cannot read until delivered.
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { secretIdSchema, secretInputSchema } from "@/lib/secrets/schema";

export interface SecretActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  secretId?: string;
}

export async function prepareSecret(
  _prev: SecretActionResult | null,
  formData: FormData,
): Promise<SecretActionResult> {
  const parsed = secretInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    recipientId: formData.get("recipientId"),
    linkedWishId: formData.get("linkedWishId"),
    revealAt: formData.get("revealAt"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const account = await requireAccount();

  if (parsed.data.recipientId === user.id) {
    return { ok: false, error: "Không thể chuẩn bị bí mật cho chính mình" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("secrets")
    .insert({
      account_id: account.accountId,
      prepared_by: user.id,
      recipient_id: parsed.data.recipientId,
      linked_wish_id: parsed.data.linkedWishId ?? null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      reveal_at: parsed.data.revealAt ?? null,
      status: "preparing",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: `Không lưu được bí mật: ${error.message}` };
  }

  revalidatePath("/secrets");
  return { ok: true, secretId: data.id as string };
}

export async function updateSecret(
  id: string,
  _prev: SecretActionResult | null,
  formData: FormData,
): Promise<SecretActionResult> {
  const idParsed = secretIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID bí mật không hợp lệ" };

  const parsed = secretInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    recipientId: formData.get("recipientId"),
    linkedWishId: formData.get("linkedWishId"),
    revealAt: formData.get("revealAt"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("secrets")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      linked_wish_id: parsed.data.linkedWishId ?? null,
      reveal_at: parsed.data.revealAt ?? null,
    })
    .eq("id", idParsed.data);

  if (error) {
    return { ok: false, error: `Không cập nhật được: ${error.message}` };
  }

  revalidatePath("/secrets");
  revalidatePath(`/secrets/${idParsed.data}/edit`);
  return { ok: true, secretId: idParsed.data };
}

/** Mark a secret as ready (still hidden from recipient). */
export async function markReady(id: string): Promise<SecretActionResult> {
  const idParsed = secretIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID bí mật không hợp lệ" };

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("secrets")
    .update({ status: "ready" })
    .eq("id", idParsed.data);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/secrets");
  return { ok: true };
}

/** Deliver: status → delivered + delivered_at = now. Recipient unlocked. */
export async function markDelivered(id: string): Promise<SecretActionResult> {
  const idParsed = secretIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID bí mật không hợp lệ" };

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("secrets")
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", idParsed.data);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/secrets");
  return { ok: true };
}

export async function deleteSecret(id: string): Promise<SecretActionResult> {
  const idParsed = secretIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID bí mật không hợp lệ" };

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("secrets").delete().eq("id", idParsed.data);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/secrets");
  return { ok: true };
}
