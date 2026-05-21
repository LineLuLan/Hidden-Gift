"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAvatar, uploadAvatar } from "@/lib/profile/actions";

interface AvatarUploaderProps {
  currentUrl: string | null;
  initials: string;
}

export function AvatarUploader({ currentUrl, initials }: AvatarUploaderProps) {
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh phải dưới 2MB");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    const fd = new FormData();
    fd.set("avatar", file);
    startTransition(async () => {
      const r = await uploadAvatar(null, fd);
      if (!r.ok) {
        toast.error(r.error ?? "Lỗi upload");
        setPreview(currentUrl);
        return;
      }
      toast.success("Đã cập nhật ảnh");
      if (r.avatarUrl) setPreview(r.avatarUrl);
    });
  };

  const handleDelete = () => {
    if (!confirm("Xoá ảnh đại diện?")) return;
    startTransition(async () => {
      const r = await deleteAvatar();
      if (!r.ok) toast.error(r.error ?? "Lỗi xoá");
      else {
        toast.success("Đã xoá ảnh");
        setPreview(null);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ảnh đại diện</CardTitle>
        <CardDescription>
          JPG / PNG / WebP dưới 2MB. Hiện trên sidebar, lời mời, ping.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="bg-accent text-primary relative inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {preview ? (
            <Image
              src={preview}
              alt="Avatar"
              width={80}
              height={80}
              className="h-20 w-20 object-cover"
              unoptimized
            />
          ) : (
            <span className="text-2xl font-semibold">{initials}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {pending ? "Đang lưu..." : preview ? "Đổi ảnh" : "Chọn ảnh"}
          </Button>
          {preview ? (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Xoá
            </Button>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
