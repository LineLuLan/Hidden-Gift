/**
 * @file app/auth/signout/route.ts
 * @description POST /auth/signout — clears Supabase session and redirects to /login.
 *              Form-action target from the app header user menu.
 * @phase 1
 */

import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
