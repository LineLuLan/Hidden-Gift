/**
 * @file lib/wishes/queries.ts
 * @description Wish read queries — call from Server Components. RLS scopes to current user.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface Wish {
  id: string;
  account_id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  image_url: string | null;
  priority: number;
  is_fulfilled: boolean;
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Maximum active (non-fulfilled) wishes per user on Free tier. */
export const FREE_TIER_WISH_LIMIT = 5;

export async function listWishes(): Promise<Wish[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .order("is_fulfilled", { ascending: true })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Không tải được danh sách wish: ${error.message}`);
  return (data ?? []) as unknown as Wish[];
}

export async function getWish(id: string): Promise<Wish | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("wishes").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Không tải được wish: ${error.message}`);
  return (data as unknown as Wish | null) ?? null;
}

export async function countActiveWishes(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("wishes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_fulfilled", false);

  if (error) throw new Error(`Không đếm được wish: ${error.message}`);
  return count ?? 0;
}
