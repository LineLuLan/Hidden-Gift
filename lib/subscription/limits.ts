/**
 * @file lib/subscription/limits.ts
 * @description Single source of truth for tier limits. Wire every gate (wishes,
 *              letters, memories, zones, countdowns, bucket, notes, vault) here.
 *              Pro limits use very high finite numbers instead of Infinity so
 *              JSON serialization and DB comparison stay sane.
 */

import "server-only";

import { getSubscription, isPro } from "@/lib/subscription/get";

export interface TierLimits {
  ownedZones: number;
  wishesPerUser: number;
  lettersPerMonth: number;
  memories: number;
  countdowns: number;
  bucketItems: number;
  notes: number;
  vaultMb: number;
  giftCardTemplates: number;
}

const PRO_UNCAPPED = 999_999;

export const FREE_LIMITS: TierLimits = {
  ownedZones: 1,
  wishesPerUser: 5,
  lettersPerMonth: 3,
  memories: 100,
  countdowns: 1,
  bucketItems: 10,
  notes: 20,
  vaultMb: 200,
  giftCardTemplates: 3,
};

export const PRO_LIMITS: TierLimits = {
  ownedZones: PRO_UNCAPPED,
  wishesPerUser: PRO_UNCAPPED,
  lettersPerMonth: PRO_UNCAPPED,
  memories: 1000,
  countdowns: PRO_UNCAPPED,
  bucketItems: PRO_UNCAPPED,
  notes: PRO_UNCAPPED,
  vaultMb: 5000,
  giftCardTemplates: PRO_UNCAPPED,
};

export async function getLimits(userId: string): Promise<TierLimits> {
  const sub = await getSubscription(userId);
  return isPro(sub) ? PRO_LIMITS : FREE_LIMITS;
}

/** Lightweight check used in UI to render Pro nudge copy. */
export async function isUserPro(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  return isPro(sub);
}
