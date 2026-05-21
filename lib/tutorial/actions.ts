/**
 * @file lib/tutorial/actions.ts
 * @description Server Actions for the onboarding tutorial. Tracks completion
 *              per account_member so a user joining a new zone can re-run it.
 */

"use server";

import { revalidatePath } from "next/cache";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export interface TutorialActionResult {
  ok: boolean;
  error?: string;
}

/** Mark tutorial complete for current user × current account membership. */
export async function markTutorialComplete(): Promise<TutorialActionResult> {
  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const { error } = await supabase
    .from("account_members")
    .update({ tutorial_completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("account_id", account.accountId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true };
}

/** Restart tutorial: clear completion flag → next render auto-starts tour. */
export async function restartTutorial(): Promise<TutorialActionResult> {
  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const { error } = await supabase
    .from("account_members")
    .update({ tutorial_completed_at: null })
    .eq("user_id", user.id)
    .eq("account_id", account.accountId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true };
}
