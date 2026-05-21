"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCountdown,
  updateCountdown,
  type CountdownActionResult,
} from "@/lib/countdowns/actions";

interface CountdownFormProps {
  mode: "create" | "edit";
  defaultValues?: {
    id?: string;
    title?: string;
    targetDate?: string;
    isRecurring?: boolean;
    emoji?: string | null;
    note?: string | null;
  };
}

export function CountdownForm({ mode, defaultValues }: CountdownFormProps) {
  const router = useRouter();
  const action =
    mode === "create" ? createCountdown : updateCountdown.bind(null, defaultValues?.id ?? "");
  const [state, formAction, pending] = useActionState<CountdownActionResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok && state.countdownId) {
      toast.success(mode === "create" ? "Đã tạo countdown 📅" : "Đã cập nhật");
      router.push("/countdowns");
      router.refresh();
    }
  }, [state, mode, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="emoji">Emoji (tuỳ chọn)</Label>
        <Input
          id="emoji"
          name="emoji"
          maxLength={10}
          defaultValue={defaultValues?.emoji ?? ""}
          placeholder="💝"
          className="w-24"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Tên dịp</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={100}
          defaultValue={defaultValues?.title ?? ""}
          placeholder="Ví dụ: Ngày yêu nhau, Sinh nhật Linh, Kỷ niệm 100 ngày"
          aria-invalid={Boolean(state?.fieldErrors?.title)}
        />
        {state?.fieldErrors?.title?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="targetDate">Ngày</Label>
        <Input
          id="targetDate"
          name="targetDate"
          type="date"
          required
          defaultValue={defaultValues?.targetDate ?? ""}
        />
        {state?.fieldErrors?.targetDate?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.targetDate[0]}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="isRecurring"
          name="isRecurring"
          type="checkbox"
          defaultChecked={defaultValues?.isRecurring ?? false}
          className="border-input mt-0.5 h-4 w-4 rounded border"
        />
        <div className="space-y-0.5">
          <Label htmlFor="isRecurring" className="cursor-pointer">
            Lặp lại hàng năm
          </Label>
          <p className="text-muted-foreground text-xs">
            Bật cho sinh nhật / ngày kỷ niệm — sau khi ngày trôi qua, hệ thống tự dời sang năm sau.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Ghi chú (tuỳ chọn)</Label>
        <Textarea
          id="note"
          name="note"
          maxLength={500}
          rows={3}
          defaultValue={defaultValues?.note ?? ""}
          placeholder="Vài dòng kỷ niệm để nhớ vì sao ngày này đặc biệt..."
        />
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
              ? "Đang tạo..."
              : "Đang lưu..."
            : mode === "create"
              ? "Tạo countdown"
              : "Lưu thay đổi"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
