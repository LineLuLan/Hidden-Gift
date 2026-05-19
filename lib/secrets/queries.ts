/**
 * @file lib/secrets/queries.ts
 * @description Read queries. RLS scopes: prepared_by sees always;
 *              recipient sees only when status='delivered'.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export type SecretStatus = "preparing" | "ready" | "delivered";

export interface Secret {
  id: string;
  account_id: string;
  prepared_by: string;
  recipient_id: string;
  linked_wish_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  status: SecretStatus;
  reveal_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

/** All secrets visible to the current user (own prepared + delivered to them). */
export async function listSecrets(): Promise<Secret[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("secrets")
    .select("*")
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Không tải được bí mật: ${error.message}`);
  return (data ?? []) as unknown as Secret[];
}

export async function getSecret(id: string): Promise<Secret | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("secrets").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Không tải được bí mật: ${error.message}`);
  return (data as unknown as Secret | null) ?? null;
}
