/**
 * @file lib/memories/actions.ts
 * @description Upload + delete memories via Supabase Storage (bucket "memories").
 *              When R2 keys arrive, swap the storage backend here; downstream
 *              consumers only care about `media_url` on the memory row.
 */

"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { memoryIdSchema, memoryMetadataSchema } from "@/lib/memories/schema";

const BUCKET = "memories";
const MAX_BYTES = 10 * 1024 * 1024; // mirror bucket policy

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const ALLOWED_VIDEO_MIMES = new Set(["video/mp4", "video/quicktime"]);

export interface MemoryActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  memoryId?: string;
  mediaUrl?: string;
}

export async function uploadMemory(
  _prev: MemoryActionResult | null,
  formData: FormData,
): Promise<MemoryActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Vui lòng chọn ảnh/video để upload" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File vượt 10MB — giảm chất lượng và thử lại" };
  }

  const mime = file.type || "application/octet-stream";
  let mediaType: "image" | "video";
  if (ALLOWED_IMAGE_MIMES.has(mime)) mediaType = "image";
  else if (ALLOWED_VIDEO_MIMES.has(mime)) mediaType = "video";
  else {
    return { ok: false, error: `Định dạng ${mime} không được hỗ trợ` };
  }

  const parsed = memoryMetadataSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    takenAt: formData.get("takenAt"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  // Path: <account_id>/<random>.<ext> — RLS reads first folder as account_id
  const ext = file.name.split(".").pop()?.toLowerCase() ?? mime.split("/")[1] ?? "bin";
  const path = `${account.accountId}/${randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: mime,
    cacheControl: "31536000",
    upsert: false,
  });
  if (upErr) {
    return { ok: false, error: `Không upload được: ${upErr.message}` };
  }

  // Signed URL (private bucket) — long expiry; UI re-requests as needed
  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
  if (signErr || !signed) {
    return { ok: false, error: "Không tạo được signed URL" };
  }

  const { data, error } = await supabase
    .from("memories")
    .insert({
      account_id: account.accountId,
      uploaded_by: user.id,
      title: parsed.data.title ?? null,
      description: parsed.data.description ?? null,
      media_url: path, // store path; we generate signed URL on read
      media_type: mediaType,
      media_size: file.size,
      taken_at: parsed.data.takenAt ?? null,
    })
    .select("id")
    .single();
  if (error) {
    // Try to clean up the orphaned file
    void supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, error: `Không lưu được kỷ niệm: ${error.message}` };
  }

  revalidatePath("/memories");
  return { ok: true, memoryId: data.id as string, mediaUrl: signed.signedUrl };
}

export async function deleteMemory(id: string): Promise<MemoryActionResult> {
  const idParsed = memoryIdSchema.safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID không hợp lệ" };

  await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("memories")
    .select("media_url")
    .eq("id", idParsed.data)
    .maybeSingle();

  const { error } = await supabase.from("memories").delete().eq("id", idParsed.data);
  if (error) return { ok: false, error: error.message };

  if (existing) {
    const path = (existing as { media_url: string }).media_url;
    void supabase.storage.from(BUCKET).remove([path]);
  }

  revalidatePath("/memories");
  return { ok: true };
}

/**
 * Re-sign URLs for a batch of memory paths. Called from Server Components
 * before rendering the gallery. Paths invalid for the caller (RLS-blocked)
 * yield empty strings and consumers skip them.
 */
export async function signMemoryUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, 60 * 60 * 24 * 7);
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
  }
  return out;
}
