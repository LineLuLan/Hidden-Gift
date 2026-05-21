import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

import { AcceptInviteForm } from "@/components/account/accept-invite-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Lời mời" };

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const cleanedCode = code.trim().toUpperCase();
  const user = await getCurrentUser();

  // Look up the account behind the code. Use admin client (service role) so anon
  // visitors can resolve the invite before they sign in. Only display_name returns.
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("accounts")
    .select("id, display_name, invite_code")
    .eq("invite_code", cleanedCode)
    .maybeSingle();

  if (!account) {
    return (
      <div className="bg-background flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Mã mời không hợp lệ</CardTitle>
            <CardDescription>
              Mã &ldquo;{cleanedCode}&rdquo; không tồn tại hoặc đã được dùng. Xin partner tạo mã mới
              nha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost">
              <Link href="/">← Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inviterName = (account as { display_name: string | null }).display_name;

  // If user not signed in, route them through signup with invite code preserved
  if (!user) {
    const callbackUrl = `/invite/${cleanedCode}`;
    redirect(`/login?next=${encodeURIComponent(callbackUrl)}`);
  }

  // Already authenticated → show accept UI
  return (
    <div className="bg-background flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="bg-accent text-primary mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Lời mời từ {inviterName}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Trở thành partner của {inviterName} trên Hidden Gift.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trước khi nhận lời mời</CardTitle>
            <CardDescription>
              Nếu bạn đã có wish nào trong tài khoản hiện tại, chúng sẽ được chuyển sang tài khoản
              couple với {inviterName}. Tài khoản cũ của bạn sẽ bị xoá. Không thể hoàn tác.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AcceptInviteForm code={cleanedCode} inviterName={inviterName} />
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-xs">
          Đăng nhập sai tài khoản?{" "}
          <Link href="/auth/signout" className="text-primary hover:underline">
            Đăng xuất
          </Link>{" "}
          rồi vào lại link mời.
        </p>
      </div>
    </div>
  );
}
