import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/server";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return <LoginForm googleEnabled={features.googleAuth} />;
}
