/**
 * @file lib/countdowns/queries.ts
 * @description Server-only read queries. RLS scopes to all account members.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

import type { Countdown } from "@/lib/countdowns/view";
export { computeCountdownView, type Countdown, type CountdownView } from "@/lib/countdowns/view";

/** All countdowns visible to current user (RLS-scoped). */
export async function listCountdowns(): Promise<Countdown[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("countdowns")
    .select("*")
    .order("target_date", { ascending: true });

  if (error) throw new Error(`Không tải được lịch: ${error.message}`);
  return (data ?? []) as unknown as Countdown[];
}

export async function getCountdown(id: string): Promise<Countdown | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("countdowns").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Không tải được countdown: ${error.message}`);
  return (data as unknown as Countdown | null) ?? null;
}

export async function countCountdowns(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("countdowns")
    .select("id", { count: "exact", head: true })
    .eq("created_by", userId);
  if (error) throw new Error(`Không đếm được countdown: ${error.message}`);
  return count ?? 0;
}
