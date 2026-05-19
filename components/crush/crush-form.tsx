"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { saveCrushProfile, type CrushActionResult } from "@/lib/crush/actions";
import type { Crush } from "@/lib/crush/queries";

function toLocal(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface CrushFormProps {
  crush: Crush | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function CrushForm({ crush, onSaved, onCancel }: CrushFormProps) {
  const [state, action, pending] = useActionState<CrushActionResult | null, FormData>(
    saveCrushProfile,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success("Đã lưu crush profile");
      onSaved?.();
    }
  }, [state, onSaved]);

  return (
    <Card>
      <CardContent className="p-5">
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[80px_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                name="emoji"
                maxLength={10}
                defaultValue={crush?.emoji ?? ""}
                placeholder="🌸"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nickname">Tên / biệt danh *</Label>
              <Input
                id="nickname"
                name="nickname"
                required
                maxLength={80}
                defaultValue={crush?.nickname ?? ""}
                placeholder="Ví dụ: cô bé tóc ngắn lớp Anh 2"
                aria-invalid={Boolean(state?.fieldErrors?.nickname)}
              />
              {state?.fieldErrors?.nickname?.[0] ? (
                <p className="text-destructive text-xs">{state.fieldErrors.nickname[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Vì sao crush?</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={1000}
              defaultValue={crush?.bio ?? ""}
              placeholder="Cái gì làm bạn rung động về người ta..."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="metAt">Bắt đầu để ý</Label>
              <Input
                id="metAt"
                name="metAt"
                type="datetime-local"
                defaultValue={toLocal(crush?.met_at)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Trạng thái</Label>
              <select
                id="status"
                name="status"
                defaultValue={crush?.status ?? "crushing"}
                className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="crushing">Đang crush</option>
                <option value="confessed">Đã tỏ tình</option>
                <option value="rejected">Friendzoned</option>
                <option value="together">Thành đôi</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="countdownLabel">Đếm ngược (label)</Label>
              <Input
                id="countdownLabel"
                name="countdownLabel"
                maxLength={80}
                defaultValue={crush?.countdown_label ?? ""}
                placeholder="VD: Gặp lại / 100 ngày"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="countdownTo">Đếm ngược đến</Label>
              <Input
                id="countdownTo"
                name="countdownTo"
                type="datetime-local"
                defaultValue={toLocal(crush?.countdown_to)}
              />
            </div>
          </div>

          {state?.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Đang lưu..." : crush ? "Cập nhật" : "Lưu crush"}
            </Button>
            {onCancel ? (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
                Huỷ
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
