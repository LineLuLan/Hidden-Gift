/**
 * @file lib/gift-ideas/queries.ts
 * @description Read queries for curated gift catalog. Public table (no RLS).
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface GiftIdea {
  id: string;
  title: string;
  description: string | null;
  category: string;
  occasion: string[] | null;
  price_min: number | null;
  price_max: number | null;
  persona_fit: string[] | null;
  emoji: string | null;
  image_url: string | null;
  popularity: number;
  created_at: string;
}

export type Persona = "student" | "office-worker" | "long-distance";
export type Occasion =
  | "birthday"
  | "anniversary"
  | "100-days"
  | "valentine"
  | "8-3"
  | "20-10"
  | "long-distance"
  | "random";

export interface GiftIdeaFilters {
  category?: string;
  occasion?: Occasion;
  persona?: Persona;
  /** Inclusive max budget in VND. */
  maxBudget?: number;
}

export async function listGiftIdeas(
  filters: GiftIdeaFilters = {},
  limit = 60,
): Promise<GiftIdea[]> {
  const supabase = await createClient();
  let q = supabase
    .from("gift_ideas")
    .select("*")
    .order("popularity", { ascending: false })
    .limit(limit);

  if (filters.category) q = q.eq("category", filters.category);
  if (filters.occasion) q = q.contains("occasion", [filters.occasion]);
  if (filters.persona) q = q.contains("persona_fit", [filters.persona]);
  if (typeof filters.maxBudget === "number") {
    q = q.lte("price_min", filters.maxBudget);
  }

  const { data, error } = await q;
  if (error) throw new Error(`Không tải được gợi ý: ${error.message}`);
  return (data ?? []) as unknown as GiftIdea[];
}
