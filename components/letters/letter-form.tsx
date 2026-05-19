"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LetterEditor } from "@/components/letters/letter-editor";
import { saveLetter, type LetterActionResult } from "@/lib/letters/actions";

interface LetterFormProps {
  mode: "create" | "edit";
  recipientId: string;
  recipientName: string;
  defaultValues?: {
    id?: string;
    subject?: string;
    /** Tiptap JSON doc or legacy {type:"text",content:string}. */
    body?: unknown;
    scheduledFor?: string;
    isDraft?: boolean;
  };
}

function toDatetimeInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LetterForm({ mode, recipientId, recipientName, defaultValues }: LetterFormProps) {
  const router = useRouter();
  const action = saveLetter.bind(null, defaultValues?.id ?? null);
  const [state, formAction, pending] = useActionState<LetterActionResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok && state.letterId) {
      toast.success(mode === "create" ? "Đã lưu thư" : "Đã cập nhật");
      router.push("/letters");
      router.refresh();
    }
  }, [state, mode, router]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="recipientId" value={recipientId} />
      <div className="bg-accent/40 rounded-md border p-3 text-sm">
        Gửi tới: <span className="font-medium">{recipientName}</span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Tiêu đề</Label>
        <Input
          id="subject"
          name="subject"
          required
          maxLength={200}
          defaultValue={defaultValues?.subject ?? ""}
          placeholder="Ví dụ: Gửi em ngày 8/3"
        />
        {state?.fieldErrors?.subject?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.subject[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Nội dung</Label>
        <LetterEditor
          name="body"
          defaultValue={defaultValues?.body}
          placeholder="Viết lời gửi tương lai..."
        />
        {state?.fieldErrors?.body?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.body[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="scheduledFor">Giao vào lúc</Label>
        <Input
          id="scheduledFor"
          name="scheduledFor"
          type="datetime-local"
          required
          defaultValue={toDatetimeInputValue(defaultValues?.scheduledFor)}
        />
        {state?.fieldErrors?.scheduledFor?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.scheduledFor[0]}</p>
        ) : null}
      </div>

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="isDraft" value="true" variant="outline" disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu nháp"}
        </Button>
        <Button type="submit" name="isDraft" value="false" disabled={pending}>
          {pending ? "Đang lên lịch..." : "Lên lịch gửi"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
