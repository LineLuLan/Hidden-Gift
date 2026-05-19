/**
 * @file trigger/purge-deleted-accounts.ts
 * @description Daily cron job that hard-deletes accounts whose
 *              `deletion_requested_at` is older than 30 days. Cascades via
 *              FK ON DELETE CASCADE on every user-data table.
 */

import { schedules, logger } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export const purgeDeletedAccounts = schedules.task({
  id: "purge-deleted-accounts",
  cron: "0 3 * * *", // 03:00 UTC daily (10:00 Asia/Ho_Chi_Minh)
  maxDuration: 300,
  run: async () => {
    const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: expired, error } = await admin
      .from("accounts")
      .select("id, deletion_requested_at, account_members(user_id)")
      .lte("deletion_requested_at", cutoff)
      .not("deletion_requested_at", "is", null)
      .limit(100);

    if (error) {
      logger.error("Query failed", { error: error.message });
      return { purged: 0, error: error.message };
    }
    if (!expired || expired.length === 0) {
      return { purged: 0 };
    }

    logger.info(`Purging ${expired.length} expired accounts`);

    let purged = 0;
    for (const acct of expired) {
      const members = (acct as { account_members?: { user_id: string }[] }).account_members ?? [];
      // Delete each member's auth.users row → cascades to public schema rows
      for (const m of members) {
        const { error: delErr } = await admin.auth.admin.deleteUser(m.user_id);
        if (delErr) {
          logger.warn("deleteUser failed", { user_id: m.user_id, error: delErr.message });
        }
      }
      // Delete the (now-orphan) account row
      await admin
        .from("accounts")
        .delete()
        .eq("id", acct.id as string);
      purged += 1;
    }

    return { purged };
  },
});
