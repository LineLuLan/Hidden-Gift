"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { uploadMemory } from "@/lib/memories/actions";
import { isImageFile, isVideoFile, prepareImageForUpload } from "@/lib/memories/client-prep";
import { cn } from "@/lib/utils/cn";

export function MemoryUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (chosen: File | null) => {
    setError(null);
    if (!chosen) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!isImageFile(chosen) && !isVideoFile(chosen)) {
      setError("Định dạng không hỗ trợ. Chọn ảnh JPG/PNG/HEIC hoặc video MP4/MOV.");
      return;
    }

    if (isVideoFile(chosen)) {
      setFile(chosen);
      setPreview(URL.createObjectURL(chosen));
      return;
    }

    setPreparing(true);
    try {
      const prepared = await prepareImageForUpload(chosen);
      setFile(prepared.file);
      setPreview(URL.createObjectURL(prepared.file));
      if (prepared.converted) {
        toast.success(
          `Đã chuẩn bị ảnh (${prepared.width}×${prepared.height}, ${Math.round(prepared.file.size / 1024)}KB)`,
        );
      }
    } catch (err) {
      console.error("[memory-prep]", err);
      setError("Không xử lý được ảnh — thử lại với file khác");
    } finally {
      setPreparing(false);
    }
  };

  const handleSubmit = (formData: FormData) => {
    if (!file) {
      setError("Vui lòng chọn file trước");
      return;
    }
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadMemory(null, formData);
      if (!result.ok) {
        setError(result.error ?? "Lỗi upload");
        return;
      }
      toast.success("Đã thêm vào kỷ niệm");
      router.push("/memories");
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <Card
        className={cn(
          "border-dashed transition-colors",
          file ? "border-primary/40" : "hover:border-primary/40 cursor-pointer",
        )}
        onClick={() => !file && inputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          {!file ? (
            <>
              <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="font-medium">Chọn ảnh hoặc video</p>
              <p className="text-muted-foreground text-xs">
                JPG / PNG / HEIC / MP4 / MOV — tối đa 10MB
                <br />
                Ảnh HEIC từ iPhone sẽ tự chuyển sang JPEG
              </p>
            </>
          ) : preview && isVideoFile(file) ? (
            <video src={preview} controls className="max-h-72 w-auto rounded-md" />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="max-h-72 w-auto rounded-md" />
          ) : null}

          {file ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleFiles(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                aria-label="Bỏ chọn"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,image/heic,image/heif,video/mp4,video/quicktime"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files?.[0] ?? null)}
      />

      {preparing ? <p className="text-muted-foreground text-sm">Đang xử lý ảnh...</p> : null}

      <div className="space-y-1.5">
        <Label htmlFor="title">Tiêu đề (tuỳ chọn)</Label>
        <Input id="title" name="title" maxLength={200} placeholder="Đà Lạt 2026" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Khoảnh khắc, cảm xúc..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="takenAt">Ngày chụp (tuỳ chọn)</Label>
        <Input id="takenAt" name="takenAt" type="datetime-local" />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending || preparing || !file}>
          {pending ? "Đang upload..." : preparing ? "Đang xử lý..." : "Upload"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
