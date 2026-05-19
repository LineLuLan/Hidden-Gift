import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SecretList } from "@/components/secrets/secret-list";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, getPartner, isPartnerLinked } from "@/lib/account/queries";
import { listSecrets } from "@/lib/secrets/queries";

export const metadata: Metadata = { title: "Bí mật" };

export default async function SecretsPage() {
  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);

  if (!detail || !isPartnerLinked(detail)) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight">Bí mật</h1>
          <p className="text-muted-foreground text-sm">
            Chuẩn bị quà bí mật cho partner — ẩn tuyệt đối ở tầng database.
          </p>
        </header>
        <Card>
          <CardHeader>
            <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Heart className="h-6 w-6" />
            </div>
            <CardTitle className="mt-2">Cần partner trước</CardTitle>
            <CardDescription>
              Tính năng Bí mật cần 2 người. Tạo mã mời ở Cài đặt và gửi cho người ấy để hai bạn cùng
              dùng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings">Tới Cài đặt → mời partner</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const partner = getPartner(detail, user.id);
  const partnerName = partner?.display_name ?? "Partner";
  const secrets = await listSecrets();

  return (
    <div className="mx-auto max-w-3xl">
      <SecretList currentUserId={user.id} partnerName={partnerName} secrets={secrets} />
    </div>
  );
}
