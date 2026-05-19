/**
 * @file lib/memories/queries.ts
 * @description Read queries for memories. RLS scopes to account members.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface Memory {
  id: string;
  account_id: string;
  uploaded_by: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: "image" | "video";
  media_size: number | null;
  taken_at: string | null;
  created_at: string;
}

export async function listMemories(): Promise<Memory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .order("taken_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Không tải được kỷ niệm: ${error.message}`);
  return (data ?? []) as unknown as Memory[];
}

export async function getMemory(id: string): Promise<Memory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("memories").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Không tải được kỷ niệm: ${error.message}`);
  return (data as unknown as Memory | null) ?? null;
}
