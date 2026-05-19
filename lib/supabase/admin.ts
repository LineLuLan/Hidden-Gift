/**
 * @file lib/supabase/admin.ts
 * @description Service-role Supabase client. BYPASSES RLS — use only for:
 *              - Background jobs (Trigger.dev)
 *              - Admin scripts / migrations from app code
 *              - Webhook handlers that must write across tenants
 *              NEVER expose to browser. NEVER use in user-facing routes.
 * @phase 1
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export function createAdminClient() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
