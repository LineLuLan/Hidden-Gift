/**
 * @file lib/notifications/queries.ts
 * @description Unread / pending counts across all features for the notification bell.
 *              All queries scoped to the current user via RLS.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface NotificationCounts {
  unreadPings: number;
  receivedSecrets: number; // delivered to me, count = "new arrival" feel
  receivedLetters: number; // delivered to me
  total: number;
}

/**
 * One round-trip to load 3 counts in parallel.
 */
export async function getNotificationCounts(userId: string): Promise<NotificationCounts> {
  const supabase = await createClient();

  const [pings, secrets, letters] = await Promise.all([
    supabase
      .from("emoji_pings")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .is("read_at", null),
    supabase
      .from("secrets")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("status", "delivered"),
    supabase
      .from("letters")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .not("delivered_at", "is", null),
  ]);

  const unreadPings = pings.count ?? 0;
  const receivedSecrets = secrets.count ?? 0;
  const receivedLetters = letters.count ?? 0;

  return {
    unreadPings,
    receivedSecrets,
    receivedLetters,
    total: unreadPings + receivedSecrets + receivedLetters,
  };
}
