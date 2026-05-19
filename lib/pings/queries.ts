/**
 * @file lib/pings/queries.ts
 * @description Read queries for emoji pings — visible to sender OR recipient via RLS.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface EmojiPing {
  id: string;
  account_id: string;
  sender_id: string;
  recipient_id: string;
  emoji: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
}

export async function listPings(limit = 50): Promise<EmojiPing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emoji_pings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Không tải được ping: ${error.message}`);
  return (data ?? []) as unknown as EmojiPing[];
}

export async function countUnreadPings(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("emoji_pings")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) throw new Error(`Không đếm được ping: ${error.message}`);
  return count ?? 0;
}
