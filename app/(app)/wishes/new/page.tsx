import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { WishForm } from "@/components/wishes/wish-form";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Tạo điều ước" };

export default async function NewWishPage() {
  await requireUser();
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
        <h1 className="text-2xl font-semibold tracking-tight">Tạo điều ước mới</h1>
        <p className="text-muted-foreground text-sm">
          Chỉ bạn thấy điều ước này. Partner sẽ phát hiện thông qua {`"Bí mật"`} khi bạn liên kết
          với 1 wish.
        </p>
      </header>
      <WishForm mode="create" />
    </div>
  );
}
