import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { LetterForm } from "@/components/letters/letter-form";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, getPartner, isPartnerLinked } from "@/lib/account/queries";
import { getLetter, getLetterText } from "@/lib/letters/queries";

export const metadata: Metadata = { title: "Sửa thư" };

interface EditLetterPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLetterPage({ params }: EditLetterPageProps) {
  const user = await requireUser();
  const account = await requireAccount();
  const { id } = await params;

  const letter = await getLetter(id);
  if (!letter) notFound();
  if (letter.sender_id !== user.id) redirect("/letters");
  if (letter.delivered_at) redirect(`/letters/${letter.id}`);

  const detail = await getAccountDetail(account.accountId);
  if (!detail || !isPartnerLinked(detail)) redirect("/letters");
  const partner = getPartner(detail, user.id);
  if (!partner) redirect("/letters");

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
        <h1 className="text-2xl font-semibold tracking-tight">Sửa thư</h1>
        <p className="text-muted-foreground text-sm">Chỉ có thể sửa khi thư chưa được giao.</p>
      </header>
      <LetterForm
        mode="edit"
        recipientId={partner.user_id}
        recipientName={partner.display_name ?? "Partner"}
        defaultValues={{
          id: letter.id,
          subject: letter.subject,
          bodyText: getLetterText(letter),
          scheduledFor: letter.scheduled_for,
          isDraft: letter.is_draft,
        }}
      />
    </div>
  );
}
