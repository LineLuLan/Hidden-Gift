/**
 * @file lib/subscription/get.ts
 * @description Per-user subscription state. Returns 'free' by default for users
 *              without a subscriptions row.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export type SubscriptionPlan = "free" | "pro" | "trialing" | "past_due" | "cancelled";

export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  features: Record<string, boolean>;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
}

const DEFAULT_SUBSCRIPTION = (userId: string): Subscription => ({
  userId,
  plan: "free",
  features: {},
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelledAt: null,
});

/** Read the current user's subscription. Returns Free default if no row. */
export async function getSubscription(userId: string): Promise<Subscription> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, plan, features, current_period_start, current_period_end, cancelled_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return DEFAULT_SUBSCRIPTION(userId);

  const row = data as {
    user_id: string;
    plan: SubscriptionPlan;
    features: Record<string, boolean>;
    current_period_start: string | null;
    current_period_end: string | null;
    cancelled_at: string | null;
  };

  return {
    userId: row.user_id,
    plan: row.plan,
    features: row.features ?? {},
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelledAt: row.cancelled_at,
  };
}

/**
 * Returns true if subscription is currently active Pro.
 *   - plan in (pro, trialing)
 *   - current_period_end is in the future (or null = lifetime)
 */
export function isPro(sub: Subscription): boolean {
  if (sub.plan !== "pro" && sub.plan !== "trialing") return false;
  if (!sub.currentPeriodEnd) return true;
  return new Date(sub.currentPeriodEnd).getTime() > Date.now();
}
