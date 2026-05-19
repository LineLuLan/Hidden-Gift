import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireAccount, requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Bắt đầu" };

export default async function OnboardingPage() {
  await requireUser();
  const account = await requireAccount();

  // If user already finished onboarding, drop them on the dashboard.
  if (account.onboardedAt) {
    redirect("/");
  }

  return <OnboardingWizard />;
}
