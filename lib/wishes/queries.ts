/**
 * @file lib/wishes/queries.ts
 * @description Wish read queries. RLS scopes to account members (ADR-003).
 *              Owner CRUD only; non-owner sees + claims.
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

/**
 * All wishes visible to the current user. Post ADR-003 this returns
 * wishes of every account member (couple/squad/family), not just self.
 */
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

/** Only wishes I own. Used by free-tier 5-cap UI counter. */
export async function listOwnWishes(userId: string): Promise<Wish[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("user_id", userId)
    .order("is_fulfilled", { ascending: true })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Không tải được wish của bạn: ${error.message}`);
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

/**
 * Claim status for a wish, visible to non-owner members only.
 * Owner of the wish will receive an empty result because RLS hides
 * non-delivered secrets from them.
 */
export interface WishClaim {
  secretId: string;
  preparedBy: string;
  status: "preparing" | "ready" | "delivered";
  claimedAt: string;
}

export interface WishClaimStatus {
  wishId: string;
  claims: WishClaim[];
  isClaimedByMe: boolean;
  isClaimedByOther: boolean;
}

/** Batch claim-status fetch for a list of wishes (avoids N+1). */
export async function getClaimStatusMap(
  wishIds: string[],
  currentUserId: string,
): Promise<Map<string, WishClaimStatus>> {
  const map = new Map<string, WishClaimStatus>();
  for (const id of wishIds) {
    map.set(id, { wishId: id, claims: [], isClaimedByMe: false, isClaimedByOther: false });
  }

  if (wishIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("secrets")
    .select("id, prepared_by, status, created_at, linked_wish_id")
    .in("linked_wish_id", wishIds)
    .neq("status", "delivered");

  if (error) {
    // Don't throw — claim status is non-critical UI affordance
    return map;
  }

  type SecretRow = {
    id: string;
    prepared_by: string;
    status: "preparing" | "ready" | "delivered";
    created_at: string;
    linked_wish_id: string;
  };

  for (const row of (data ?? []) as SecretRow[]) {
    const entry = map.get(row.linked_wish_id);
    if (!entry) continue;
    entry.claims.push({
      secretId: row.id,
      preparedBy: row.prepared_by,
      status: row.status,
      claimedAt: row.created_at,
    });
    if (row.prepared_by === currentUserId) entry.isClaimedByMe = true;
    else entry.isClaimedByOther = true;
  }

  return map;
}
