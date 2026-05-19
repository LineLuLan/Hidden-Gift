/**
 * @file lib/supabase/client.ts
 * @description Browser Supabase client. Use in Client Components only.
 *              For realtime subscriptions and client-side queries.
 * @phase 0/1
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
