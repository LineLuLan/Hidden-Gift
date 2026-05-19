import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { SecretForm } from "@/components/secrets/secret-form";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, getPartner, isPartnerLinked } from "@/lib/account/queries";
import { getSecret } from "@/lib/secrets/queries";

export const metadata: Metadata = { title: "Sửa bí mật" };

interface EditSecretPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSecretPage({ params }: EditSecretPageProps) {
  const user = await requireUser();
  const account = await requireAccount();
  const { id } = await params;

  const secret = await getSecret(id);
  if (!secret) notFound();

  // Only the preparer can edit
  if (secret.prepared_by !== user.id) {
    redirect("/secrets");
  }

  const detail = await getAccountDetail(account.accountId);
  if (!detail || !isPartnerLinked(detail)) redirect("/secrets");
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
        <h1 className="text-2xl font-semibold tracking-tight">Sửa bí mật</h1>
        <p className="text-muted-foreground text-sm">
          Cập nhật tiêu đề, mô tả, hoặc ngày dự định tặng. Vẫn ẩn cho tới khi bạn bấm Tặng ngay.
        </p>
      </header>
      <SecretForm
        mode="edit"
        recipientId={partner.user_id}
        recipientName={partner.display_name ?? "Partner"}
        defaultValues={{
          id: secret.id,
          title: secret.title,
          description: secret.description,
          reveal_at: secret.reveal_at,
        }}
      />
    </div>
  );
}
