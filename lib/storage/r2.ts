/**
 * @file lib/storage/r2.ts
 * @description Cloudflare R2 client (S3-compatible). Returns null when keys are
 *              missing — caller falls back to Supabase Storage. R2 swap is
 *              opt-in: set CLOUDFLARE_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY
 *              + R2_PUBLIC_URL and features.r2 = true.
 */

import "server-only";

import { env, features } from "@/lib/env";

let cachedClient: import("@aws-sdk/client-s3").S3Client | null = null;

export async function getR2Client() {
  if (!features.r2) return null;
  if (cachedClient) return cachedClient;
  const { S3Client } = await import("@aws-sdk/client-s3");
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return cachedClient;
}

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Direct PUT — fine for ≤ 10MB. For large files prefer presigned URLs from
 * the browser; that path lives in getPresignedUploadUrl below.
 */
export async function r2PutObject(params: {
  key: string;
  body: ArrayBuffer | Buffer | Uint8Array;
  contentType: string;
}): Promise<UploadResult | null> {
  const client = await getR2Client();
  if (!client) return null;
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: params.key,
      Body: params.body instanceof ArrayBuffer ? new Uint8Array(params.body) : params.body,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return {
    key: params.key,
    url: `${env.R2_PUBLIC_URL}/${params.key}`,
  };
}

export async function r2DeleteObject(key: string): Promise<boolean> {
  const client = await getR2Client();
  if (!client) return false;
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  await client.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
  return true;
}

/** Presigned PUT URL for browser direct-upload (10 minute expiry). */
export async function getR2PresignedPut(params: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<string | null> {
  const client = await getR2Client();
  if (!client) return null;
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: params.key,
    ContentType: params.contentType,
  });
  return getSignedUrl(client, command, {
    expiresIn: params.expiresIn ?? 600,
  });
}
