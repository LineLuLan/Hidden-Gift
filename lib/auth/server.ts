/**
 * @file lib/auth/server.ts
 * @description Server-side auth helpers. Use in Server Components, Server Actions, Route Handlers.
 *              getCurrentUser → User | null. requireUser → User (redirect to /login if null).
 * @phase 1
 */

import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export interface AccountContext {
  accountId: string;
  role: "owner" | "partner" | "member";
  displayName: string | null;
}

/**
 * Get the primary account for the current user (the one auto-created on signup).
 * Returns null if not authenticated. Throws if authenticated but no account row (shouldn't happen
 * due to handle_new_user trigger).
 */
export async function getCurrentAccount(): Promise<AccountContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("account_members")
    .select("account_id, role, display_name")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load account: ${error.message}`);
  }
  if (!data) {
    throw new Error(
      "User authenticated but no account membership. handle_new_user trigger may be missing.",
    );
  }

  return {
    accountId: data.account_id as string,
    role: data.role as AccountContext["role"],
    displayName: (data.display_name as string | null) ?? null,
  };
}

export async function requireAccount(): Promise<AccountContext> {
  const ctx = await getCurrentAccount();
  if (!ctx) redirect("/login");
  return ctx;
}
