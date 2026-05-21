"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createWish, updateWish, type WishActionResult } from "@/lib/wishes/actions";
import { celebrate } from "@/lib/utils/celebrate";

interface WishFormProps {
  mode: "create" | "edit";
  defaultValues?: {
    id?: string;
    title?: string;
    description?: string | null;
    emoji?: string | null;
  };
}

export function WishForm({ mode, defaultValues }: WishFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createWish : updateWish.bind(null, defaultValues?.id ?? "");
  const [state, formAction, pending] = useActionState<WishActionResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok && state.wishId) {
      if (mode === "create") {
        celebrate();
        toast.success("Đã tạo điều ước 💝");
      } else {
        toast.success("Đã cập nhật");
      }
      router.push("/wishes");
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
          placeholder="💍"
          className="w-24"
        />
        {state?.fieldErrors?.emoji?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.emoji[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Điều ước</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={100}
          defaultValue={defaultValues?.title ?? ""}
          placeholder="Ví dụ: Một chuyến đi Đà Lạt cùng nhau"
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
          maxLength={500}
          rows={4}
          defaultValue={defaultValues?.description ?? ""}
          placeholder="Mô tả thêm để partner hiểu rõ hơn..."
          aria-invalid={Boolean(state?.fieldErrors?.description)}
        />
        {state?.fieldErrors?.description?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.description[0]}</p>
        ) : null}
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
              ? "Tạo điều ước"
              : "Lưu thay đổi"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
