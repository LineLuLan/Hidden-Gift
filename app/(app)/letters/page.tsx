import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LetterList } from "@/components/letters/letter-list";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, isPartnerLinked } from "@/lib/account/queries";
import { listLetters } from "@/lib/letters/queries";

export const metadata: Metadata = { title: "Thư hẹn giờ" };

export default async function LettersPage() {
  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);

  if (!detail || !isPartnerLinked(detail)) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight">Thư hẹn giờ</h1>
          <p className="text-muted-foreground text-sm">
            Viết thư gửi đến ngày tương lai — partner mở vào đúng thời điểm bạn chọn.
          </p>
        </header>
        <Card>
          <CardHeader>
            <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="mt-2">Cần partner trước</CardTitle>
            <CardDescription>Mời partner ở Cài đặt để mở tính năng này.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings">Tới Cài đặt</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const letters = await listLetters();

  return (
    <div className="mx-auto max-w-3xl">
      <LetterList currentUserId={user.id} members={detail.members} letters={letters} />
    </div>
  );
}
