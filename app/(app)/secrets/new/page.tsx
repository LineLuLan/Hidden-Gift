import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { SecretForm } from "@/components/secrets/secret-form";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, getPartner, isPartnerLinked } from "@/lib/account/queries";

export const metadata: Metadata = { title: "Chuẩn bị bí mật" };

export default async function NewSecretPage() {
  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);

  if (!detail || !isPartnerLinked(detail)) {
    redirect("/secrets");
  }

  const partner = getPartner(detail, user.id);
  if (!partner) redirect("/secrets");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/secrets"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Bí mật
      </Link>
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Chuẩn bị bí mật</h1>
        <p className="text-muted-foreground text-sm">
          {partner.display_name ?? "Partner"} sẽ KHÔNG biết bạn đang chuẩn bị — enforce ngay ở tầng
          database (RLS).
        </p>
      </header>
      <SecretForm
        mode="create"
        recipientId={partner.user_id}
        recipientName={partner.display_name ?? "Partner"}
      />
    </div>
  );
}
