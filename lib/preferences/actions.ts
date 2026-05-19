/**
 * @file lib/preferences/actions.ts
 * @description Update caller's email notification preferences (per-user, on
 *              account_members.email_prefs JSONB column).
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAccount, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const prefsSchema = z.object({
  letter_delivered: z.boolean().default(true),
  invite_accepted: z.boolean().default(true),
  wrapped_yearly: z.boolean().default(true),
  ping_summary: z.boolean().default(false),
});

export interface PrefsActionResult {
  ok: boolean;
  error?: string;
}

export async function updateEmailPrefs(
  _prev: PrefsActionResult | null,
  formData: FormData,
): Promise<PrefsActionResult> {
  const parsed = prefsSchema.safeParse({
    letter_delivered: formData.get("letter_delivered") === "on",
    invite_accepted: formData.get("invite_accepted") === "on",
    wrapped_yearly: formData.get("wrapped_yearly") === "on",
    ping_summary: formData.get("ping_summary") === "on",
  });
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ" };

  const user = await requireUser();
  const account = await requireAccount();
  const supabase = await createClient();

  const { error } = await supabase
    .from("account_members")
    .update({ email_prefs: parsed.data })
    .eq("user_id", user.id)
    .eq("account_id", account.accountId);
  if (error) return { ok: false, error: `Không lưu được: ${error.message}` };

  revalidatePath("/settings");
  return { ok: true };
}
