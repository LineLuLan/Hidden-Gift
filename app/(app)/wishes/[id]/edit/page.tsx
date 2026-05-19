import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { WishForm } from "@/components/wishes/wish-form";
import { requireUser } from "@/lib/auth/server";
import { getWish } from "@/lib/wishes/queries";

export const metadata: Metadata = { title: "Sửa điều ước" };

interface EditWishPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWishPage({ params }: EditWishPageProps) {
  await requireUser();
  const { id } = await params;
  const wish = await getWish(id);
  if (!wish) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/wishes"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Danh sách điều ước
      </Link>
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sửa điều ước</h1>
        <p className="text-muted-foreground text-sm">
          Cập nhật chi tiết, đổi emoji, hoặc xoá hẳn nếu không còn mong muốn.
        </p>
      </header>
      <WishForm
        mode="edit"
        defaultValues={{
          id: wish.id,
          title: wish.title,
          description: wish.description,
          emoji: wish.emoji,
        }}
      />
    </div>
  );
}
