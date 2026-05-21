"use client";

import { useTransition } from "react";
import { Pencil, Heart, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatRelative } from "@/lib/utils/format";
import { deleteCrush, switchToCoupleMode } from "@/lib/crush/actions";
import type { Crush } from "@/lib/crush/queries";

interface CrushCardProps {
  crush: Crush;
  onEdit: () => void;
}

const STATUS_LABEL: Record<Crush["status"], { label: string; tone: string }> = {
  crushing: { label: "Đang crush 🌸", tone: "bg-accent text-accent-foreground" },
  confessed: { label: "Đã tỏ tình 💌", tone: "bg-primary/15 text-primary" },
  rejected: { label: "Friendzoned 🥲", tone: "bg-muted text-muted-foreground" },
  together: { label: "Thành đôi rồi 🎉", tone: "bg-primary text-primary-foreground" },
};

export function CrushCard({ crush, onEdit }: CrushCardProps) {
  const [pending, startTransition] = useTransition();
  const status = STATUS_LABEL[crush.status];

  const daysSince = crush.met_at
    ? Math.floor(
        // eslint-disable-next-line react-hooks/purity
        (Date.now() - new Date(crush.met_at).getTime()) / (24 * 60 * 60 * 1000),
      )
    : null;

  const countdownDays = crush.countdown_to
    ? Math.ceil(
        // eslint-disable-next-line react-hooks/purity
        (new Date(crush.countdown_to).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
      )
    : null;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <div className="bg-accent text-primary inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl">
            {crush.emoji ?? "💝"}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                status.tone,
              )}
            >
              {status.label}
            </span>
            <h2 className="mt-1 text-2xl font-semibold">{crush.nickname}</h2>
            {crush.bio ? (
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">{crush.bio}</p>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Sửa">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-t pt-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {crush.met_at ? (
              <div className="flex items-start gap-2">
                <Calendar className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <dt className="text-muted-foreground text-xs">Bắt đầu để ý</dt>
                  <dd className="font-medium">
                    {formatDate(crush.met_at)}
                    {daysSince !== null ? (
                      <span className="text-muted-foreground ml-1 font-normal">
                        ({daysSince} ngày)
                      </span>
                    ) : null}
                  </dd>
                </div>
              </div>
            ) : null}

            {crush.countdown_to ? (
              <div className="flex items-start gap-2">
                <Clock className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {crush.countdown_label ?? "Đếm ngược"}
                  </dt>
                  <dd className="font-medium">
                    {countdownDays !== null && countdownDays >= 0
                      ? `Còn ${countdownDays} ngày`
                      : `Đã qua ${Math.abs(countdownDays ?? 0)} ngày`}
                    <span className="text-muted-foreground ml-1 font-normal">
                      ({formatRelative(crush.countdown_to)})
                    </span>
                  </dd>
                </div>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              if (!confirm("Xoá crush profile? Diary entries vẫn giữ lại.")) return;
              startTransition(async () => {
                const r = await deleteCrush();
                if (!r.ok) toast.error(r.error ?? "Lỗi xoá");
                else toast.success("Đã xoá profile");
              });
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            Xoá profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              if (!confirm("Đổi sang Couple mode? Crush profile vẫn giữ riêng tư.")) return;
              startTransition(async () => {
                const r = await switchToCoupleMode();
                if (!r.ok) toast.error(r.error ?? "Lỗi");
                else toast.success("Đã chuyển sang Couple mode");
              });
            }}
          >
            <Heart className="h-4 w-4" />
            Chuyển sang Couple mode
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
