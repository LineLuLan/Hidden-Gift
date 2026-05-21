import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { CountdownForm } from "@/components/countdowns/countdown-form";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Thêm lịch kỷ niệm" };

export default async function NewCountdownPage() {
  await requireUser();

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
        <h1 className="text-2xl font-semibold tracking-tight">Thêm lịch kỷ niệm</h1>
        <p className="text-muted-foreground text-sm">
          Đếm ngày tới sinh nhật, kỷ niệm, hay dịp đặc biệt. Cả nhóm cùng thấy.
        </p>
      </header>
      <CountdownForm mode="create" />
    </div>
  );
}
