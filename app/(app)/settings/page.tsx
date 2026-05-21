import type { Metadata } from "next";
import { Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteCard } from "@/components/account/invite-card";
import { ProfileForm } from "@/components/account/profile-form";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataControls } from "@/components/profile/data-controls";
import { ModeSwitcher } from "@/components/profile/mode-switcher";
import { EmailPrefsCard } from "@/components/profile/email-prefs";
import { TutorialToggle } from "@/components/settings/tutorial-toggle";
import { getSubscription, isPro } from "@/lib/subscription/get";
import { DEFAULT_PREFS, type EmailPrefs } from "@/lib/preferences/schema";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, isPartnerLinked } from "@/lib/account/queries";
import { createClient } from "@/lib/supabase/server";

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

  // Fetch deletion status separately (not in AccountContext yet)
  const supabase = await createClient();
  const { data: acctMeta } = await supabase
    .from("accounts")
    .select("deletion_requested_at")
    .eq("id", account.accountId)
    .maybeSingle();
  const deletionRequestedAt =
    (acctMeta as { deletion_requested_at?: string | null } | null)?.deletion_requested_at ?? null;

  const initials = (userMember?.display_name ?? user.email ?? "B").slice(0, 2).toUpperCase();

  // Fetch caller's email preferences from member row
  const { data: prefsRow } = await supabase
    .from("account_members")
    .select("email_prefs")
    .eq("user_id", user.id)
    .eq("account_id", account.accountId)
    .maybeSingle();
  const emailPrefs: EmailPrefs = {
    ...DEFAULT_PREFS,
    ...((prefsRow as { email_prefs?: Partial<EmailPrefs> } | null)?.email_prefs ?? {}),
  };

  const subscription = await getSubscription(user.id);
  const userIsPro = isPro(subscription);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground text-sm">Quản lý tài khoản, profile, dữ liệu.</p>
      </header>

      <AvatarUploader currentUrl={userMember?.avatar_url ?? null} initials={initials} />

      <Card>
        <CardHeader>
          <div className="bg-accent text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <CardTitle className="mt-2">Thành viên ({detail.members.length})</CardTitle>
          <CardDescription>
            {linked
              ? "Account đã đủ thành viên cho mode hiện tại."
              : "Mời thêm người để mở khoá tính năng nhóm."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {detail.members.map((m) => (
            <div
              key={m.id}
              className="border-border bg-muted/40 flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-3">
                {m.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="bg-accent text-primary inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
                    {(m.display_name ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
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
              </div>
              {m.user_id === user.id ? (
                <span className="text-muted-foreground text-xs">(bạn)</span>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <ModeSwitcher
        currentKind={account.kind}
        memberCount={detail.members.length}
        isOwner={userMember?.role === "owner"}
      />

      <Card>
        <CardHeader>
          <CardTitle>Tên hiển thị</CardTitle>
          <CardDescription>
            Đổi nickname của bạn. Partner sẽ thấy tên này trong ping, secrets, letters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm currentDisplayName={userMember?.display_name ?? null} />
        </CardContent>
      </Card>

      <InviteCard
        initialCode={detail.invite_code}
        isOwner={userMember?.role === "owner"}
        alreadyLinked={linked}
      />

      <EmailPrefsCard current={emailPrefs} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="inline-flex items-center gap-2">
                <Sparkles className="text-primary h-4 w-4" />
                Subscription
              </CardTitle>
              <CardDescription>
                {userIsPro ? "Bạn đang ở gói Pro 💝" : "Đang ở Free — xem Pro mở khoá gì thêm"}
              </CardDescription>
            </div>
            <span
              className={
                userIsPro
                  ? "bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium"
                  : "bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium"
              }
            >
              {userIsPro ? "PRO" : "FREE"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild variant={userIsPro ? "outline" : "default"}>
            <Link href="/settings/subscription">
              {userIsPro ? "Xem chi tiết" : "Xem Pro 29k/tháng"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
          <CardDescription>
            Chạy lại tour ngắn để xem các tính năng. Bấm vào sẽ quay về Trang chủ + tour mở lại tự
            động.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TutorialToggle />
        </CardContent>
      </Card>

      <DataControls deletionRequestedAt={deletionRequestedAt} />
    </div>
  );
}
