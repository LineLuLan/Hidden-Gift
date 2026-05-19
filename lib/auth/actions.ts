/**
 * @file lib/auth/actions.ts
 * @description Server Actions for auth flows. Supabase Auth (email/password + Google OAuth).
 * @phase 1
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { env, features } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/auth/schema";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function signUpWithEmail(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? env.NEXT_PUBLIC_APP_URL;

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${origin}/auth/callback?next=/`,
    },
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  redirect("/verify?email=" + encodeURIComponent(parsed.data.email));
}

export async function signInWithEmail(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle(): Promise<void> {
  if (!features.googleAuth) {
    throw new Error("Google OAuth chưa được cấu hình");
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? env.NEXT_PUBLIC_APP_URL;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(mapAuthError(error.message));
  }
  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Translate Supabase Auth error codes to Vietnamese user-facing strings. */
function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email hoặc mật khẩu không đúng";
  }
  if (lower.includes("email not confirmed")) {
    return "Email chưa xác nhận. Kiểm tra hộp thư.";
  }
  if (lower.includes("user already registered")) {
    return "Email này đã đăng ký. Đăng nhập thay vì đăng ký mới.";
  }
  if (lower.includes("password should be at least")) {
    return "Mật khẩu cần ít nhất 8 ký tự";
  }
  if (lower.includes("rate limit")) {
    return "Bạn thao tác quá nhanh. Thử lại sau vài phút.";
  }
  return message;
}
