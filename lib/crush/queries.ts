/**
 * @file lib/crush/queries.ts
 * @description Read crush profile + diary entries. RLS user-private.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CrushStatus = "crushing" | "confessed" | "rejected" | "together";

export interface Crush {
  id: string;
  account_id: string;
  user_id: string;
  nickname: string;
  bio: string | null;
  emoji: string | null;
  met_at: string | null;
  countdown_label: string | null;
  countdown_to: string | null;
  status: CrushStatus;
  created_at: string;
  updated_at: string;
}

export interface DiaryEntry {
  id: string;
  account_id: string;
  user_id: string;
  entry_date: string;
  mood: string | null;
  content: string;
  created_at: string;
}

/** Caller's own crush profile (one per account). */
export async function getMyCrush(): Promise<Crush | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crushes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Không tải được crush: ${error.message}`);
  return (data as unknown as Crush | null) ?? null;
}

export async function listDiaryEntries(limit = 30): Promise<DiaryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crush_diary")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Không tải được nhật ký: ${error.message}`);
  return (data ?? []) as unknown as DiaryEntry[];
}
