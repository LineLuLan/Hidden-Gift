import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { LetterForm } from "@/components/letters/letter-form";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, isPartnerLinked } from "@/lib/account/queries";

export const metadata: Metadata = { title: "Viết thư" };

export default async function NewLetterPage() {
  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);
  if (!detail || !isPartnerLinked(detail)) redirect("/letters");
  const recipients = detail.members
    .filter((m) => m.user_id !== user.id)
    .map((m) => ({ id: m.user_id, name: m.display_name ?? "Thành viên" }));
  if (recipients.length === 0) redirect("/letters");

  // default schedule: 24h from now (server-side timestamp, fresh per request)
  // eslint-disable-next-line react-hooks/purity
  const defaultSchedule = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/letters"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Thư hẹn giờ
      </Link>
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Viết thư mới</h1>
        <p className="text-muted-foreground text-sm">
          Người nhận chỉ thấy thư sau khi đã giao — bạn có thể giao tự động theo lịch (nếu
          Trigger.dev được cấu hình) hoặc bấm Giao ngay sau khi đến hạn.
        </p>
      </header>
      <LetterForm
        mode="create"
        recipients={recipients}
        defaultValues={{ scheduledFor: defaultSchedule, isDraft: true }}
      />
    </div>
  );
}
