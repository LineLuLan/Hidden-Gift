/**
 * @file lib/wrapped/queries.ts
 * @description Compute year-end stats per user. Filters via RLS so each user
 *              only sees their own counts.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface WrappedStats {
  year: number;
  wishesCount: number;
  wishesFulfilledCount: number;
  secretsPreparedCount: number;
  secretsDeliveredCount: number;
  lettersSentCount: number;
  lettersDeliveredCount: number;
  memoriesCount: number;
  pingsSentCount: number;
  pingsReceivedCount: number;
  diaryEntriesCount: number;
  topMonth: { month: number; activityCount: number } | null;
}

export async function computeWrappedStats(
  userId: string,
  year: number = new Date().getFullYear(),
): Promise<WrappedStats> {
  const supabase = await createClient();
  const yearStart = new Date(Date.UTC(year, 0, 1)).toISOString();
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1)).toISOString();

  const [w, wf, sp, sd, ls, ld, mem, ps, pr, diary] = await Promise.all([
    supabase
      .from("wishes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", yearStart)
      .lt("created_at", yearEnd),
    supabase
      .from("wishes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_fulfilled", true)
      .gte("fulfilled_at", yearStart)
      .lt("fulfilled_at", yearEnd),
    supabase
      .from("secrets")
      .select("id", { count: "exact", head: true })
      .eq("prepared_by", userId)
      .gte("created_at", yearStart)
      .lt("created_at", yearEnd),
    supabase
      .from("secrets")
      .select("id", { count: "exact", head: true })
      .eq("prepared_by", userId)
      .eq("status", "delivered")
      .gte("delivered_at", yearStart)
      .lt("delivered_at", yearEnd),
    supabase
      .from("letters")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", userId)
      .gte("created_at", yearStart)
      .lt("created_at", yearEnd),
    supabase
      .from("letters")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", userId)
      .not("delivered_at", "is", null)
      .gte("delivered_at", yearStart)
      .lt("delivered_at", yearEnd),
    supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("uploaded_by", userId)
      .gte("created_at", yearStart)
      .lt("created_at", yearEnd),
    supabase
      .from("emoji_pings")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", userId)
      .gte("created_at", yearStart)
      .lt("created_at", yearEnd),
    supabase
      .from("emoji_pings")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .gte("created_at", yearStart)
      .lt("created_at", yearEnd),
    supabase
      .from("crush_diary")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", yearStart)
      .lt("created_at", yearEnd),
  ]);

  // Top month: walk pings by month bucket — single small extra query
  const { data: byMonth } = await supabase
    .from("emoji_pings")
    .select("created_at")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .gte("created_at", yearStart)
    .lt("created_at", yearEnd);
  const monthCounts = new Map<number, number>();
  for (const row of byMonth ?? []) {
    const m = new Date((row as { created_at: string }).created_at).getUTCMonth();
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }
  let topMonth: WrappedStats["topMonth"] = null;
  for (const [m, c] of monthCounts) {
    if (!topMonth || c > topMonth.activityCount) {
      topMonth = { month: m + 1, activityCount: c };
    }
  }

  return {
    year,
    wishesCount: w.count ?? 0,
    wishesFulfilledCount: wf.count ?? 0,
    secretsPreparedCount: sp.count ?? 0,
    secretsDeliveredCount: sd.count ?? 0,
    lettersSentCount: ls.count ?? 0,
    lettersDeliveredCount: ld.count ?? 0,
    memoriesCount: mem.count ?? 0,
    pingsSentCount: ps.count ?? 0,
    pingsReceivedCount: pr.count ?? 0,
    diaryEntriesCount: diary.count ?? 0,
    topMonth,
  };
}
