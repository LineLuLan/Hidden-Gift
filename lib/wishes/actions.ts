/**
 * @file lib/wishes/actions.ts
 * @description Server Actions: createWish, updateWish, toggleFulfilled, deleteWish.
 *              Free-tier enforces max 5 active wishes per user.
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { FREE_TIER_WISH_LIMIT, countActiveWishes } from "@/lib/wishes/queries";
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

  const activeCount = await countActiveWishes(user.id);
  if (activeCount >= FREE_TIER_WISH_LIMIT) {
    return {
      ok: false,
      error: `Bạn đã có ${FREE_TIER_WISH_LIMIT} điều ước đang chờ. Hoàn thành 1 cái rồi tạo thêm nha.`,
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
