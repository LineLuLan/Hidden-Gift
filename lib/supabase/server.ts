/**
 * @file lib/supabase/server.ts
 * @description Server Supabase client for Server Components, Route Handlers, and Server Actions.
 *              Reads cookies for auth context. Subject to RLS as authenticated user.
 * @phase 0/1
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware will refresh session.
          }
        },
      },
    },
  );
}
