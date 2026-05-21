/**
 * @file lib/wishes/actions.ts
 * @description Server Actions: createWish, updateWish, toggleFulfilled, deleteWish,
 *              claimWish, unclaimWish, markGifted (ADR-003 silent-claim flow).
 *              Free-tier enforces max 5 active wishes per user.
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { getLimits } from "@/lib/subscription/limits";
import { createClient } from "@/lib/supabase/server";
import { countActiveWishes } from "@/lib/wishes/queries";
import { wishIdSchema, wishInputSchema } from "@/lib/wishes/schema";

export interface WishActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  wishId?: string;
}

export async function createWish(
  _prev: WishActionResult | null,
  formData: FormData,
): Promise<WishActionResult> {
  const parsed = wishInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    emoji: formData.get("emoji"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const account = await requireAccount();

  const limits = await getLimits(user.id);
  const activeCount = await countActiveWishes(user.id);
  if (activeCount >= limits.wishesPerUser) {
    return {
      ok: false,
      error: `Bạn đã có ${limits.wishesPerUser} điều ước đang chờ. Hoàn thành 1 cái rồi tạo thêm — hoặc lên Pro để không giới hạn 💝.`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .insert({
      account_id: account.accountId,
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      emoji: parsed.data.emoji ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: `Không lưu được wish: ${error.message}` };
  }

  revalidatePath("/wishes");
  return { ok: true, wishId: data.id as string };
}

export async function updateWish(
  id: string,
  _prev: WishActionResult | null,
  formData: FormData,
): Promise<WishActionResult> {
  const idParsed = wishIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, error: "ID wish không hợp lệ" };
  }

  const parsed = wishInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    emoji: formData.get("emoji"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("wishes")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      emoji: parsed.data.emoji ?? null,
    })
    .eq("id", idParsed.data);

  if (error) {
    return { ok: false, error: `Không cập nhật được wish: ${error.message}` };
  }

  revalidatePath("/wishes");
  revalidatePath(`/wishes/${idParsed.data}/edit`);
  return { ok: true, wishId: idParsed.data };
}

export async function toggleWishFulfilled(id: string): Promise<WishActionResult> {
  const idParsed = wishIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, error: "ID wish không hợp lệ" };
  }

  await requireUser();
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("wishes")
    .select("is_fulfilled")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "Không tìm thấy wish" };
  }

  const nextFulfilled = !(existing as { is_fulfilled: boolean }).is_fulfilled;

  const { error } = await supabase
    .from("wishes")
    .update({
      is_fulfilled: nextFulfilled,
      fulfilled_at: nextFulfilled ? new Date().toISOString() : null,
    })
    .eq("id", idParsed.data);

  if (error) {
    return { ok: false, error: `Không cập nhật được wish: ${error.message}` };
  }

  revalidatePath("/wishes");
  return { ok: true, wishId: idParsed.data };
}

export async function deleteWish(id: string): Promise<WishActionResult> {
  const idParsed = wishIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, error: "ID wish không hợp lệ" };
  }

  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("wishes").delete().eq("id", idParsed.data);

  if (error) {
    return { ok: false, error: `Không xoá được wish: ${error.message}` };
  }

  revalidatePath("/wishes");
  return { ok: true };
}

// ─── silent claim flow (ADR-003) ──────────────────────────────────────────

export interface ClaimActionResult {
  ok: boolean;
  error?: string;
  secretId?: string;
}

/**
 * Claim a wish belonging to another account member.
 * Creates a `secrets` row with linked_wish_id set; RLS hides this from the
 * wish owner until the claimer marks gifted (status='delivered').
 */
export async function claimWish(wishId: string): Promise<ClaimActionResult> {
  const idParsed = wishIdSchema.safeParse(wishId);
  if (!idParsed.success) return { ok: false, error: "ID wish không hợp lệ" };

  const user = await requireUser();
  const supabase = await createClient();

  const { data: wish, error: fetchError } = await supabase
    .from("wishes")
    .select("id, user_id, account_id, title, is_fulfilled")
    .eq("id", idParsed.data)
    .maybeSingle();

  if (fetchError || !wish) {
    return { ok: false, error: "Không tìm thấy điều ước" };
  }

  const w = wish as {
    id: string;
    user_id: string;
    account_id: string;
    title: string;
    is_fulfilled: boolean;
  };
  if (w.user_id === user.id) {
    return { ok: false, error: "Không thể claim điều ước của chính mình" };
  }
  if (w.is_fulfilled) {
    return { ok: false, error: "Điều ước này đã hoàn thành" };
  }

  const { data, error } = await supabase
    .from("secrets")
    .insert({
      account_id: w.account_id,
      prepared_by: user.id,
      recipient_id: w.user_id,
      linked_wish_id: w.id,
      title: w.title,
      status: "preparing",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: `Không claim được: ${error.message}` };

  revalidatePath("/wishes");
  revalidatePath("/secrets");
  return { ok: true, secretId: (data as { id: string }).id };
}

/**
 * Cancel an active claim (only the claimer can; only before delivered).
 */
export async function unclaimWish(secretId: string): Promise<ClaimActionResult> {
  if (typeof secretId !== "string" || secretId.length < 10) {
    return { ok: false, error: "ID claim không hợp lệ" };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { data: secret, error: fetchError } = await supabase
    .from("secrets")
    .select("id, prepared_by, status")
    .eq("id", secretId)
    .maybeSingle();

  if (fetchError || !secret) return { ok: false, error: "Không tìm thấy claim" };

  const s = secret as { id: string; prepared_by: string; status: string };
  if (s.prepared_by !== user.id) return { ok: false, error: "Không phải claim của bạn" };
  if (s.status === "delivered") return { ok: false, error: "Đã tặng — không thể huỷ" };

  const { error } = await supabase.from("secrets").delete().eq("id", secretId);
  if (error) return { ok: false, error: `Không huỷ được: ${error.message}` };

  revalidatePath("/wishes");
  revalidatePath("/secrets");
  return { ok: true };
}

/**
 * Mark a claim as gifted. Triggers two writes:
 *   1. secrets.status='delivered', delivered_at=now  → recipient can now see
 *   2. linked wishes.is_fulfilled=true, fulfilled_at=now  → owner sees fulfilled
 * The wish-update uses an optimistic predicate to win the race if 2 members
 * mark gifted simultaneously.
 */
export async function markGifted(secretId: string): Promise<ClaimActionResult> {
  if (typeof secretId !== "string" || secretId.length < 10) {
    return { ok: false, error: "ID claim không hợp lệ" };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { data: secret, error: fetchError } = await supabase
    .from("secrets")
    .select("id, prepared_by, linked_wish_id, status")
    .eq("id", secretId)
    .maybeSingle();

  if (fetchError || !secret) return { ok: false, error: "Không tìm thấy claim" };

  const s = secret as {
    id: string;
    prepared_by: string;
    linked_wish_id: string | null;
    status: string;
  };
  if (s.prepared_by !== user.id) return { ok: false, error: "Không phải claim của bạn" };
  if (s.status === "delivered") return { ok: false, error: "Đã tặng rồi" };

  const nowIso = new Date().toISOString();

  const { error: secretError } = await supabase
    .from("secrets")
    .update({ status: "delivered", delivered_at: nowIso })
    .eq("id", secretId);
  if (secretError) return { ok: false, error: `Không cập nhật được: ${secretError.message}` };

  if (s.linked_wish_id) {
    // Optimistic: only flip if not already fulfilled (avoid races between squad members)
    await supabase
      .from("wishes")
      .update({ is_fulfilled: true, fulfilled_at: nowIso })
      .eq("id", s.linked_wish_id)
      .eq("is_fulfilled", false);
  }

  revalidatePath("/wishes");
  revalidatePath("/secrets");
  return { ok: true };
}
