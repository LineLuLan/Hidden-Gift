/**
 * @file trigger/wrapped-recap.ts
 * @description Annual cron that materializes a notification to each user on
 *              December 1, prompting them to view /wrapped (computed live).
 *              Lightweight — just sends a ping-style notification per user.
 *
 *              Future: pre-compute stats into a `wrapped_yearly` table for
 *              instant load + share-image rendering.
 */

import { schedules, logger } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";

import { sendEmail } from "@/lib/email/send";
import { env } from "@/lib/env";

export const yearlyWrappedNudge = schedules.task({
  id: "yearly-wrapped-nudge",
  // December 1 at 09:00 Asia/Ho_Chi_Minh (= 02:00 UTC)
  cron: "0 2 1 12 *",
  maxDuration: 600,
  run: async () => {
    const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Page through users with activity this year
    const year = new Date().getFullYear();
    const { data: members, error } = await admin
      .from("account_members")
      .select("user_id, display_name");
    if (error || !members) {
      logger.error("Member query failed", { error: error?.message });
      return { sent: 0 };
    }

    let sent = 0;
    for (const m of members) {
      const { data: u } = await admin.auth.admin.getUserById(m.user_id as string);
      if (!u.user?.email) continue;
      await sendEmail({
        to: u.user.email,
        subject: `Wrapped ${year} — năm của bạn trên Hidden Gift 💝`,
        html: `<p>Hi ${m.display_name ?? "bạn"}, ${year} sắp khép lại.</p>
               <p>Vào <a href="${env.NEXT_PUBLIC_APP_URL}/wrapped">${env.NEXT_PUBLIC_APP_URL}/wrapped</a> xem điều ước, bí mật, thư hẹn giờ bạn đã gửi trong năm.</p>`,
      });
      sent += 1;
    }
    return { sent };
  },
});
