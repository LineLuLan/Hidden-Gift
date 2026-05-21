/**
 * @file lib/secrets/queries.ts
 * @description Read queries. Post ADR-003 RLS is 3-way:
 *              preparer always; other non-recipient members see active claims;
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

/** All secrets visible to the current user (RLS-scoped). */
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

export interface GroupedSecrets {
  preparing: Secret[]; // I am preparing
  received: Secret[]; // I am recipient, delivered
  squadActive: Secret[]; // others' active claims (squad coordination)
}

/** Group secrets by perspective relative to currentUserId. */
export function groupSecrets(rows: Secret[], currentUserId: string): GroupedSecrets {
  const preparing: Secret[] = [];
  const received: Secret[] = [];
  const squadActive: Secret[] = [];

  for (const s of rows) {
    if (s.prepared_by === currentUserId) {
      preparing.push(s);
    } else if (s.recipient_id === currentUserId) {
      // Should only see delivered ones per RLS, but defend anyway
      if (s.status === "delivered") received.push(s);
    } else {
      // I'm an account member but neither preparer nor recipient — squad coord view
      squadActive.push(s);
    }
  }

  return { preparing, received, squadActive };
}

export async function getSecret(id: string): Promise<Secret | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("secrets").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(`Không tải được bí mật: ${error.message}`);
  return (data as unknown as Secret | null) ?? null;
}
