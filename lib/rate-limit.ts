/**
 * @file lib/rate-limit.ts
 * @description Token-bucket rate limiter. Uses Upstash Ratelimit when REST URL
 *              is configured; otherwise falls back to a per-process Map (best
 *              effort, single-instance only).
 */

import "server-only";

import { features } from "@/lib/env";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // epoch ms
}

interface BucketSpec {
  /** Allowed requests in the window. */
  max: number;
  /** Window in milliseconds. */
  windowMs: number;
}

export const RATE_LIMITS = {
  login: { max: 5, windowMs: 60_000 }, // 5 attempts/minute per ip
  signup: { max: 3, windowMs: 60_000 }, // 3 signups/minute per ip
  ping: { max: 30, windowMs: 60_000 }, // 30 pings/minute per user
  letterDeliver: { max: 5, windowMs: 60_000 },
  inviteAccept: { max: 5, windowMs: 60_000 },
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

// ─── Upstash backend ───────────────────────────────────────────────────────

let upstashClient: {
  eval: (script: string, keys: string[], args: string[]) => Promise<unknown>;
  pipeline?: unknown;
} | null = null;

async function getUpstash() {
  if (!features.upstash) return null;
  if (upstashClient) return upstashClient;
  const { Redis } = await import("@upstash/redis");
  upstashClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }) as unknown as typeof upstashClient;
  return upstashClient;
}

async function consumeUpstash(key: string, spec: BucketSpec): Promise<RateLimitResult> {
  const redis = await getUpstash();
  if (!redis) return consumeInMemory(key, spec);

  // INCR + PEXPIRE NX pattern — atomic enough for soft rate limiting.
  const bucketKey = `rl:${key}`;
  // @ts-expect-error redis SDK methods loosely typed via dynamic import
  const count = (await redis.incr(bucketKey)) as number;
  if (count === 1) {
    // @ts-expect-error redis SDK methods loosely typed via dynamic import
    await redis.pexpire(bucketKey, spec.windowMs);
  }
  // @ts-expect-error redis SDK methods loosely typed via dynamic import
  const ttl = (await redis.pttl(bucketKey)) as number;
  const reset = Date.now() + (ttl > 0 ? ttl : spec.windowMs);
  return {
    success: count <= spec.max,
    remaining: Math.max(0, spec.max - count),
    reset,
  };
}

// ─── In-memory fallback ────────────────────────────────────────────────────

const memBuckets = new Map<string, { count: number; reset: number }>();

function consumeInMemory(key: string, spec: BucketSpec): RateLimitResult {
  const now = Date.now();
  const entry = memBuckets.get(key);
  if (!entry || entry.reset < now) {
    memBuckets.set(key, { count: 1, reset: now + spec.windowMs });
    return { success: true, remaining: spec.max - 1, reset: now + spec.windowMs };
  }
  entry.count += 1;
  return {
    success: entry.count <= spec.max,
    remaining: Math.max(0, spec.max - entry.count),
    reset: entry.reset,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Check + consume one token. Caller passes a stable identifier (user_id, ip,
 * email — pick the highest-cardinality available without leaking PII).
 */
export async function checkRateLimit(
  bucket: RateLimitKey,
  identifier: string,
): Promise<RateLimitResult> {
  const spec = RATE_LIMITS[bucket];
  const key = `${bucket}:${identifier}`;
  if (features.upstash) {
    try {
      return await consumeUpstash(key, spec);
    } catch (err) {
      console.warn("[rate-limit] Upstash failed, falling back:", err);
      return consumeInMemory(key, spec);
    }
  }
  return consumeInMemory(key, spec);
}

/** Convenience: throw if limit exceeded. */
export async function enforceRateLimit(bucket: RateLimitKey, identifier: string): Promise<void> {
  const result = await checkRateLimit(bucket, identifier);
  if (!result.success) {
    throw new Error(
      `Rate limit exceeded for ${bucket}. Thử lại sau ${Math.ceil(
        (result.reset - Date.now()) / 1000,
      )}s.`,
    );
  }
}
