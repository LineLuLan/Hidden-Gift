/**
 * @file lib/supabase/client.ts
 * @description Browser Supabase client. Use in Client Components only.
 *              For realtime subscriptions and client-side queries.
 * @phase 0/1
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

export function createClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
