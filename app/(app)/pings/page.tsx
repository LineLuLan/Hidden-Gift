import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PingComposer } from "@/components/pings/ping-composer";
import { PingList } from "@/components/pings/ping-list";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, getPartner, isPartnerLinked } from "@/lib/account/queries";
import { listPings } from "@/lib/pings/queries";

export const metadata: Metadata = { title: "Emoji Ping" };

export default async function PingsPage() {
  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);

  if (!detail || !isPartnerLinked(detail)) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight">Emoji Ping</h1>
          <p className="text-muted-foreground text-sm">
            Gửi emoji cho partner trong nháy mắt — qua Supabase Realtime.
          </p>
        </header>
        <Card>
          <CardHeader>
            <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Bell className="h-6 w-6" />
            </div>
            <CardTitle className="mt-2">Cần partner trước</CardTitle>
            <CardDescription>
              Ping cần người nhận. Mời partner ở Cài đặt để bật tính năng này.
            </CardDescription>
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

  const partner = getPartner(detail, user.id);
  const partnerName = partner?.display_name ?? "Partner";
  const pings = await listPings();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">Emoji Ping</h1>
        <p className="text-muted-foreground text-sm">
          Nháy nhanh cho {partnerName} — họ nhận realtime nếu đang online.
        </p>
      </header>

      <PingComposer partnerName={partnerName} />

      <section className="space-y-3">
        <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Hoạt động gần đây
        </h2>
        <PingList pings={pings} currentUserId={user.id} partnerName={partnerName} />
      </section>
    </div>
  );
}
