import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { CountdownForm } from "@/components/countdowns/countdown-form";
import { requireUser } from "@/lib/auth/server";
import { getCountdown } from "@/lib/countdowns/queries";

export const metadata: Metadata = { title: "Sửa lịch kỷ niệm" };

interface EditCountdownPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCountdownPage({ params }: EditCountdownPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const countdown = await getCountdown(id);
  if (!countdown) notFound();
  // Only creator can edit (RLS update policy enforces too, but stop early in UI)
  if (countdown.created_by !== user.id) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/countdowns"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Lịch kỷ niệm
      </Link>
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sửa lịch kỷ niệm</h1>
      </header>
      <CountdownForm
        mode="edit"
        defaultValues={{
          id: countdown.id,
          title: countdown.title,
          targetDate: countdown.target_date,
          isRecurring: countdown.is_recurring,
          emoji: countdown.emoji,
          note: countdown.note,
        }}
      />
    </div>
  );
}
