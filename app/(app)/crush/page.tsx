import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CrushHub } from "@/components/crush/crush-hub";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getMyCrush, listDiaryEntries } from "@/lib/crush/queries";

export const metadata: Metadata = { title: "Crush" };

export default async function CrushPage() {
  await requireUser();
  const account = await requireAccount();

  // Couple accounts can still access — but suggest going to dashboard
  // (Solo Crush stays private even after upgrade)
  const crush = await getMyCrush();
  const diary = await listDiaryEntries();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">Solo Crush</h1>
        <p className="text-muted-foreground text-sm">
          Riêng tư tuyệt đối — kể cả khi sau này bạn link partner, partner cũng không thấy. Ghi nhật
          ký, đếm ngược, theo dõi cảm xúc.
        </p>
      </header>

      {account.kind === "couple" && !crush ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bạn đang ở Couple mode</CardTitle>
            <CardDescription>
              Solo Crush thiết kế cho user đang crush thầm. Bạn vẫn có thể tạo profile cho fun nếu
              muốn — RLS đảm bảo dữ liệu này hoàn toàn private.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Về Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <CrushHub crush={crush} diary={diary} />
    </div>
  );
}
