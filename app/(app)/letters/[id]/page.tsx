import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, getPartner } from "@/lib/account/queries";
import { getLetter, getLetterText } from "@/lib/letters/queries";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Đọc thư" };

interface LetterReadPageProps {
  params: Promise<{ id: string }>;
}

export default async function LetterReadPage({ params }: LetterReadPageProps) {
  const user = await requireUser();
  const account = await requireAccount();
  const { id } = await params;
  const letter = await getLetter(id);
  if (!letter) notFound();

  const detail = await getAccountDetail(account.accountId);
  const partner = detail ? getPartner(detail, user.id) : null;
  const partnerName = partner?.display_name ?? "Partner";

  const isSender = letter.sender_id === user.id;
  const senderLabel = isSender ? "Bạn" : partnerName;
  const recipientLabel = isSender ? partnerName : "Bạn";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/letters"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Thư hẹn giờ
      </Link>

      <Card>
        <CardHeader>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {senderLabel} → {recipientLabel}
          </p>
          <CardTitle className="text-2xl">{letter.subject}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {letter.delivered_at
              ? `Đã giao lúc ${formatDateTime(letter.delivered_at)}`
              : `Dự kiến giao lúc ${formatDateTime(letter.scheduled_for)}`}
          </p>
        </CardHeader>
        <CardContent>
          <article className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {getLetterText(letter)}
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
