/**
 * @file lib/profile/actions.ts
 * @description Profile media + account lifecycle actions:
 *              uploadAvatar, deleteAvatar, exportData, requestDeletion, cancelDeletion.
 */

"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface ProfileActionResult {
  ok: boolean;
  error?: string;
  avatarUrl?: string;
}

export async function uploadAvatar(
  _prev: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Vui lòng chọn ảnh" };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Ảnh phải dưới 2MB" };
  }
  if (!ALLOWED_AVATAR_MIMES.has(file.type)) {
    return { ok: false, error: "Chỉ JPG / PNG / WebP" };
  }

  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const ext = file.type.split("/")[1] ?? "jpg";
  const key = `${user.id}/${randomUUID()}.${ext}`;
  const buf = await file.arrayBuffer();

  const { error: upErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(key, buf, { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, error: `Không upload được: ${upErr.message}` };

  const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(key);
  const avatarUrl = pub.publicUrl;

  const { error } = await supabase
    .from("account_members")
    .update({ avatar_url: avatarUrl })
    .eq("user_id", user.id)
    .eq("account_id", account.accountId);
  if (error) return { ok: false, error: `Không lưu được: ${error.message}` };

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { ok: true, avatarUrl };
}

export async function deleteAvatar(): Promise<ProfileActionResult> {
  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("account_members")
    .select("avatar_url")
    .eq("user_id", user.id)
    .eq("account_id", account.accountId)
    .maybeSingle();

  if (member?.avatar_url) {
    const url = (member as { avatar_url: string }).avatar_url;
    // Extract path after `/storage/v1/object/public/avatars/`
    const marker = "/avatars/";
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      const key = url.slice(idx + marker.length);
      void supabase.storage.from(AVATAR_BUCKET).remove([key]);
    }
  }

  const { error } = await supabase
    .from("account_members")
    .update({ avatar_url: null })
    .eq("user_id", user.id)
    .eq("account_id", account.accountId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { ok: true };
}

// ─── Data export ───────────────────────────────────────────────────────────

export interface ExportPayload {
  exportedAt: string;
  user: { id: string; email: string | null };
  account: unknown;
  members: unknown;
  wishes: unknown;
  secretsPrepared: unknown;
  secretsReceived: unknown;
  lettersSent: unknown;
  lettersReceived: unknown;
  memories: unknown;
  pingsSent: unknown;
  pingsReceived: unknown;
  crush: unknown;
  crushDiary: unknown;
}

/**
 * Server Action returning the user's full personal data as a single JSON object.
 * Client downloads it via Blob. Compliant with PDPL 2026 Article 16 (right to access).
 */
export async function exportMyData(): Promise<{
  ok: boolean;
  data?: ExportPayload;
  error?: string;
}> {
  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const [
    acctRes,
    membersRes,
    wishesRes,
    prepRes,
    recvSecRes,
    sentLetRes,
    recvLetRes,
    memRes,
    pingSentRes,
    pingRecvRes,
    crushRes,
    diaryRes,
  ] = await Promise.all([
    supabase.from("accounts").select("*").eq("id", account.accountId).maybeSingle(),
    supabase.from("account_members").select("*").eq("account_id", account.accountId),
    supabase.from("wishes").select("*").eq("user_id", user.id),
    supabase.from("secrets").select("*").eq("prepared_by", user.id),
    supabase.from("secrets").select("*").eq("recipient_id", user.id).eq("status", "delivered"),
    supabase.from("letters").select("*").eq("sender_id", user.id),
    supabase
      .from("letters")
      .select("*")
      .eq("recipient_id", user.id)
      .not("delivered_at", "is", null),
    supabase.from("memories").select("*").eq("uploaded_by", user.id),
    supabase.from("emoji_pings").select("*").eq("sender_id", user.id),
    supabase.from("emoji_pings").select("*").eq("recipient_id", user.id),
    supabase.from("crushes").select("*").eq("user_id", user.id),
    supabase.from("crush_diary").select("*").eq("user_id", user.id),
  ]);

  return {
    ok: true,
    data: {
      exportedAt: new Date().toISOString(),
      user: { id: user.id, email: user.email ?? null },
      account: acctRes.data,
      members: membersRes.data,
      wishes: wishesRes.data,
      secretsPrepared: prepRes.data,
      secretsReceived: recvSecRes.data,
      lettersSent: sentLetRes.data,
      lettersReceived: recvLetRes.data,
      memories: memRes.data,
      pingsSent: pingSentRes.data,
      pingsReceived: pingRecvRes.data,
      crush: crushRes.data,
      crushDiary: diaryRes.data,
    },
  };
}

// ─── Account deletion (soft) ───────────────────────────────────────────────

export async function requestDeletion(): Promise<ProfileActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_account_deletion");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}

export async function cancelDeletion(): Promise<ProfileActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_account_deletion");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}
