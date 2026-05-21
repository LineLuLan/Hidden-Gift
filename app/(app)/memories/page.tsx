import type { Metadata } from "next";
import Link from "next/link";
import { ImageIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MemoryGrid, type MemoryGridItem } from "@/components/memories/memory-grid";
import { requireUser } from "@/lib/auth/server";
import { listMemories } from "@/lib/memories/queries";
import { signMemoryUrls } from "@/lib/memories/actions";

export const metadata: Metadata = { title: "Kỷ niệm" };

// Avoid the Image lucide-react name collision with next/image
const ImgIcon = ImageIcon;

export default async function MemoriesPage() {
  const user = await requireUser();
  const memories = await listMemories();

  const signed = await signMemoryUrls(memories.map((m) => m.media_url));
  const items: MemoryGridItem[] = memories
    .filter((m) => signed[m.media_url])
    .map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      signedUrl: signed[m.media_url]!,
      mediaType: m.media_type,
      takenAt: m.taken_at,
      createdAt: m.created_at,
      isOwner: m.uploaded_by === user.id,
    }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Kỷ niệm</h1>
          <p className="text-muted-foreground text-sm">
            Album chia sẻ giữa hai bạn. Mọi thành viên trong account đều thấy ảnh và video — chỉ
            người upload mới xoá được.
          </p>
        </div>
        <Button asChild>
          <Link href="/memories/upload">
            <Plus className="h-4 w-4" />
            Thêm ảnh / video
          </Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
              <ImgIcon className="h-6 w-6" />
            </div>
            <p className="font-medium">Chưa có kỷ niệm nào</p>
            <p className="text-muted-foreground max-w-md text-sm">
              Thêm ảnh hoặc video đầu tiên. Ảnh HEIC từ iPhone tự động chuyển sang JPEG; ảnh lớn
              được resize 2048px max trước khi upload.
            </p>
            <Button asChild className="mt-2">
              <Link href="/memories/upload">
                <Plus className="h-4 w-4" />
                Upload đầu tiên
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MemoryGrid items={items} />
      )}
    </div>
  );
}
