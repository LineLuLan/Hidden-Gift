import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/server";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Đăng ký" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return <SignupForm googleEnabled={features.googleAuth} />;
}
