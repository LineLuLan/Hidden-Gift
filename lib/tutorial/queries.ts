/**
 * @file lib/tutorial/queries.ts
 * @description Read tutorial completion state for current user × account.
 */

import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Returns true if user has NOT yet completed/skipped the tutorial for this account. */
export async function shouldShowTutorial(userId: string, accountId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("account_members")
    .select("tutorial_completed_at")
    .eq("user_id", userId)
    .eq("account_id", accountId)
    .maybeSingle();

  if (error || !data) return false;
  return (data as { tutorial_completed_at: string | null }).tutorial_completed_at === null;
}
