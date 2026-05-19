/**
 * @file lib/memories/client-prep.ts
 * @description Client-side prep before upload: HEIC -> JPEG conversion (iPhones)
 *              + canvas resize to MAX_DIMENSION px to keep payload small.
 *
 *              EXIF orientation is auto-applied by canvas drawImage on modern
 *              browsers; iOS Safari 13.4+ honors image-orientation: from-image.
 */

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;
const HEIC_MIMES = new Set(["image/heic", "image/heif"]);

export interface PreparedFile {
  file: File;
  /** Pixel dimensions after resize. */
  width: number;
  height: number;
  /** True if we converted format (e.g. HEIC -> JPEG). */
  converted: boolean;
}

export async function prepareImageForUpload(input: File): Promise<PreparedFile> {
  // HEIC/HEIF: convert to JPEG first; browsers can't decode HEIC natively except Safari
  let working = input;
  let converted = false;
  if (HEIC_MIMES.has(input.type) || /\.heic$|\.heif$/i.test(input.name)) {
    const heic2any = (await import("heic2any")).default;
    const blob = (await heic2any({
      blob: input,
      toType: "image/jpeg",
      quality: JPEG_QUALITY,
    })) as Blob;
    const newName = input.name.replace(/\.(heic|heif)$/i, ".jpg");
    working = new File([blob], newName, { type: "image/jpeg" });
    converted = true;
  }

  // Decode and resize via canvas
  const dataUrl = await fileToDataUrl(working);
  const img = await loadImage(dataUrl);
  const { width: w0, height: h0 } = img;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(w0, h0));
  const targetW = Math.round(w0 * scale);
  const targetH = Math.round(h0 * scale);

  if (scale === 1 && working.type === "image/jpeg" && !converted) {
    // No resize needed and already JPEG — pass through
    return { file: working, width: w0, height: h0, converted };
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { file: working, width: w0, height: h0, converted };
  }
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const outBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!outBlob) {
    return { file: working, width: w0, height: h0, converted };
  }

  const finalName = working.name.replace(/\.[^.]+$/, ".jpg");
  const finalFile = new File([outBlob], finalName, { type: "image/jpeg" });
  return { file: finalFile, width: targetW, height: targetH, converted: true };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(heic|heif|jpg|jpeg|png|webp)$/i.test(file.name);
}
