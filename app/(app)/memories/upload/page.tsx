import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { MemoryUploader } from "@/components/memories/memory-uploader";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Thêm kỷ niệm" };

export default async function MemoryUploadPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/memories"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Kỷ niệm
      </Link>
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Thêm kỷ niệm</h1>
        <p className="text-muted-foreground text-sm">
          Ảnh/video sẽ hiện trong album chung. Mọi member account đều thấy.
        </p>
      </header>
      <MemoryUploader />
    </div>
  );
}
