import type { Metadata } from "next";
import { Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteCard } from "@/components/account/invite-card";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, isPartnerLinked } from "@/lib/account/queries";

export const metadata: Metadata = { title: "Cài đặt" };

export default async function SettingsPage() {
  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);

  if (!detail) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Cài đặt</h1>
        <p className="text-destructive">Không tải được thông tin tài khoản.</p>
      </div>
    );
  }

  const linked = isPartnerLinked(detail);
  const userMember = detail.members.find((m) => m.user_id === user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground text-sm">
          Quản lý tài khoản couple, mời partner và profile của bạn.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="bg-accent text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <CardTitle className="mt-2">Thành viên</CardTitle>
          <CardDescription>
            {linked
              ? "Couple đã đầy đủ — hai bạn có thể bắt đầu chuẩn bị bí mật cho nhau."
              : "Hiện chỉ có bạn. Mời partner để mở khoá Bí mật, Thư hẹn giờ, Ping."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {detail.members.map((m) => (
            <div
              key={m.id}
              className="border-border bg-muted/40 flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">{m.display_name ?? "Thành viên"}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  {m.role === "owner"
                    ? "Chủ tài khoản"
                    : m.role === "partner"
                      ? "Partner"
                      : "Thành viên"}
                </p>
              </div>
              {m.user_id === user.id ? (
                <span className="text-muted-foreground text-xs">(bạn)</span>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <InviteCard
        initialCode={detail.invite_code}
        isOwner={userMember?.role === "owner"}
        alreadyLinked={linked}
      />
    </div>
  );
}
