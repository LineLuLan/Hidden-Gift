/**
 * @file trigger/letter-delivery.ts
 * @description Trigger.dev cron job that delivers scheduled letters whose
 *              `scheduled_for` has passed. Runs every minute (Asia/Ho_Chi_Minh).
 *              Uses the service-role Supabase client to bypass RLS and update
 *              recipient-visible rows.
 *
 *              Job only deploys when TRIGGER_PROJECT_ID + TRIGGER_SECRET_KEY
 *              are present in environment (CLI checks via trigger.config.ts).
 */

import { schedules, logger } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";

import { sendEmail } from "@/lib/email/send";
import { letterDeliveredEmail } from "@/lib/email/templates";
import { env } from "@/lib/env";

export const deliverScheduledLetters = schedules.task({
  id: "deliver-scheduled-letters",
  // Every minute. Trigger.dev uses UTC; we filter by absolute timestamp anyway.
  cron: "* * * * *",
  maxDuration: 60,
  run: async () => {
    const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const nowIso = new Date().toISOString();
    const { data: ready, error } = await admin
      .from("letters")
      .select("id, subject, sender_id, recipient_id, scheduled_for")
      .lte("scheduled_for", nowIso)
      .is("delivered_at", null)
      .eq("is_draft", false)
      .limit(100);

    if (error) {
      logger.error("Query failed", { error: error.message });
      return { delivered: 0, error: error.message };
    }
    if (!ready || ready.length === 0) {
      return { delivered: 0 };
    }

    logger.info(`Delivering ${ready.length} letters`);

    const ids = ready.map((l) => l.id as string);
    const { error: upErr } = await admin
      .from("letters")
      .update({ delivered_at: nowIso })
      .in("id", ids);

    if (upErr) {
      logger.error("Update failed", { error: upErr.message });
      return { delivered: 0, error: upErr.message };
    }

    // Fire delivery emails in parallel — best-effort. Lookup recipient email
    // via auth.admin.getUserById (service-role privilege).
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    await Promise.allSettled(
      ready.map(async (letter) => {
        const recipientId = letter.recipient_id as string;
        const senderId = letter.sender_id as string;
        const [recipientRes, senderRes] = await Promise.all([
          admin.auth.admin.getUserById(recipientId),
          admin.auth.admin.getUserById(senderId),
        ]);
        if (recipientRes.error || !recipientRes.data.user?.email) return;
        const senderName =
          (senderRes.data.user?.user_metadata?.display_name as string | undefined) ??
          senderRes.data.user?.email?.split("@")[0] ??
          "Partner";
        const recipientName =
          (recipientRes.data.user.user_metadata?.display_name as string | undefined) ??
          recipientRes.data.user.email?.split("@")[0] ??
          "Bạn";

        const tmpl = letterDeliveredEmail({
          recipientName,
          senderName,
          letterSubject: letter.subject as string,
          letterUrl: `${baseUrl}/letters/${letter.id}`,
        });
        const email = recipientRes.data.user.email;
        if (!email) return;
        await sendEmail({
          to: email,
          subject: tmpl.subject,
          html: tmpl.html,
        });
      }),
    );

    return { delivered: ready.length };
  },
});
