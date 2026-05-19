/**
 * @file lib/account/queries.ts
 * @description Account read queries — current account, members, partner status.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface AccountMember {
  id: string;
  user_id: string;
  role: "owner" | "partner" | "member";
  display_name: string | null;
  avatar_url: string | null;
  joined_at: string;
}

export interface AccountDetail {
  id: string;
  kind: "solo" | "couple" | "squad" | "family";
  display_name: string | null;
  invite_code: string | null;
  members: AccountMember[];
}

/** Load the caller's primary account with all members. */
export async function getAccountDetail(accountId: string): Promise<AccountDetail | null> {
  const supabase = await createClient();
  const { data: account, error } = await supabase
    .from("accounts")
    .select("id, kind, display_name, invite_code")
    .eq("id", accountId)
    .maybeSingle();

  if (error) throw new Error(`Không tải được account: ${error.message}`);
  if (!account) return null;

  const { data: members, error: mErr } = await supabase
    .from("account_members")
    .select("id, user_id, role, display_name, avatar_url, joined_at")
    .eq("account_id", accountId)
    .order("joined_at", { ascending: true });

  if (mErr) throw new Error(`Không tải được members: ${mErr.message}`);

  return {
    ...(account as {
      id: string;
      kind: AccountDetail["kind"];
      display_name: string | null;
      invite_code: string | null;
    }),
    members: (members ?? []) as unknown as AccountMember[],
  };
}

/** True if account has 2+ members (couple linked). */
export function isPartnerLinked(account: AccountDetail): boolean {
  return account.members.length >= 2;
}

/** Return the other member of a 2-member account, or null. */
export function getPartner(account: AccountDetail, currentUserId: string): AccountMember | null {
  return account.members.find((m) => m.user_id !== currentUserId) ?? null;
}
