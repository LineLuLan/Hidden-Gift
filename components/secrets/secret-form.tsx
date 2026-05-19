"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { prepareSecret, updateSecret, type SecretActionResult } from "@/lib/secrets/actions";

interface SecretFormProps {
  mode: "create" | "edit";
  recipientId: string;
  recipientName: string;
  defaultValues?: {
    id?: string;
    title?: string;
    description?: string | null;
    reveal_at?: string | null;
  };
}

function toLocalDatetimeInputValue(iso?: string | null): string {
  if (!iso) return "";
  // Input type="datetime-local" expects "YYYY-MM-DDTHH:mm"
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SecretForm({ mode, recipientId, recipientName, defaultValues }: SecretFormProps) {
  const router = useRouter();
  const action =
    mode === "create" ? prepareSecret : updateSecret.bind(null, defaultValues?.id ?? "");
  const [state, formAction, pending] = useActionState<SecretActionResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok && state.secretId) {
      toast.success(mode === "create" ? "Đã lưu bí mật" : "Đã cập nhật");
      router.push("/secrets");
      router.refresh();
    }
  }, [state, mode, router]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="recipientId" value={recipientId} />
      <div className="bg-accent/40 rounded-md border p-3 text-sm">
        Người nhận: <span className="font-medium">{recipientName}</span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Tiêu đề bí mật</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={100}
          defaultValue={defaultValues?.title ?? ""}
          placeholder="Ví dụ: Vòng tay handmade kỷ niệm 100 ngày"
          aria-invalid={Boolean(state?.fieldErrors?.title)}
        />
        {state?.fieldErrors?.title?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Chi tiết (tuỳ chọn)</Label>
        <Textarea
          id="description"
          name="description"
          maxLength={1000}
          rows={4}
          defaultValue={defaultValues?.description ?? ""}
          placeholder="Lý do, kế hoạch giao, ý nghĩa..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="revealAt">Ngày dự định tặng (tuỳ chọn)</Label>
        <Input
          id="revealAt"
          name="revealAt"
          type="datetime-local"
          defaultValue={toLocalDatetimeInputValue(defaultValues?.reveal_at)}
        />
        <p className="text-muted-foreground text-xs">
          Mốc thời gian gợi nhắc — không tự gửi. Bạn vẫn cần bấm &ldquo;Tặng ngay&rdquo; khi thật sự
          tặng.
        </p>
      </div>

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? mode === "create"
              ? "Đang lưu..."
              : "Đang cập nhật..."
            : mode === "create"
              ? "Lưu bí mật"
              : "Lưu thay đổi"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
