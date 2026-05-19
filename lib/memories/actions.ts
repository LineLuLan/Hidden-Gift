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
import { features } from "@/lib/env";
import { memoryIdSchema, memoryMetadataSchema } from "@/lib/memories/schema";
import { r2DeleteObject, r2PutObject } from "@/lib/storage/r2";

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

  // Path: <account_id>/<random>.<ext> — Supabase RLS reads first folder as account_id
  const ext = file.name.split(".").pop()?.toLowerCase() ?? mime.split("/")[1] ?? "bin";
  const key = `${account.accountId}/${randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  // Storage routing: R2 if configured (full public URL persisted), else
  // Supabase Storage (path persisted, signed at read time).
  let mediaUrl: string;
  let displayUrl: string;

  if (features.r2) {
    const r2Result = await r2PutObject({
      key,
      body: arrayBuffer,
      contentType: mime,
    });
    if (!r2Result) {
      return { ok: false, error: "R2 upload failed" };
    }
    mediaUrl = r2Result.url;
    displayUrl = r2Result.url;
  } else {
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, arrayBuffer, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });
    if (upErr) {
      return { ok: false, error: `Không upload được: ${upErr.message}` };
    }
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(key, 60 * 60 * 24 * 7);
    if (signErr || !signed) {
      return { ok: false, error: "Không tạo được signed URL" };
    }
    mediaUrl = key;
    displayUrl = signed.signedUrl;
  }

  const { data, error } = await supabase
    .from("memories")
    .insert({
      account_id: account.accountId,
      uploaded_by: user.id,
      title: parsed.data.title ?? null,
      description: parsed.data.description ?? null,
      media_url: mediaUrl,
      media_type: mediaType,
      media_size: file.size,
      taken_at: parsed.data.takenAt ?? null,
    })
    .select("id")
    .single();
  if (error) {
    // Clean up orphaned upload
    if (features.r2) void r2DeleteObject(key);
    else void supabase.storage.from(BUCKET).remove([key]);
    return { ok: false, error: `Không lưu được kỷ niệm: ${error.message}` };
  }

  revalidatePath("/memories");
  return { ok: true, memoryId: data.id as string, mediaUrl: displayUrl };
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
    const url = (existing as { media_url: string }).media_url;
    // Heuristic: R2 stores full https URL; Supabase Storage stores bare path
    if (url.startsWith("http")) {
      // Extract object key from R2 public URL prefix
      const r2Prefix = process.env.R2_PUBLIC_URL ?? "";
      const key = r2Prefix && url.startsWith(r2Prefix) ? url.slice(r2Prefix.length + 1) : null;
      if (key) void r2DeleteObject(key);
    } else {
      void supabase.storage.from(BUCKET).remove([url]);
    }
  }

  revalidatePath("/memories");
  return { ok: true };
}

/**
 * Re-sign URLs for a batch of memory paths. Called from Server Components
 * before rendering the gallery. Paths invalid for the caller (RLS-blocked)
 * yield empty strings and consumers skip them.
 */
export async function signMemoryUrls(urls: string[]): Promise<Record<string, string>> {
  if (urls.length === 0) return {};
  await requireUser();

  // R2 entries already public — just echo the URL back.
  const out: Record<string, string> = {};
  const supabasePaths: string[] = [];
  for (const url of urls) {
    if (url.startsWith("http")) {
      out[url] = url;
    } else {
      supabasePaths.push(url);
    }
  }
  if (supabasePaths.length === 0) return out;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(supabasePaths, 60 * 60 * 24 * 7);
  if (error || !data) return out;
  for (const item of data) {
    if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
  }
  return out;
}
