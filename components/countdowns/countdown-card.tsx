"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2, Calendar, Repeat } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteCountdown } from "@/lib/countdowns/actions";
import { computeCountdownView, type Countdown } from "@/lib/countdowns/view";
import { formatDateTime } from "@/lib/utils/format";

interface CountdownCardProps {
  countdown: Countdown;
  /** True if current user created this entry (can edit/delete). */
  isOwner: boolean;
  /** Display name of creator for non-owner view. */
  createdByName?: string;
}

export function CountdownCard({ countdown, isOwner, createdByName }: CountdownCardProps) {
  const [pending, startTransition] = useTransition();
  const view = computeCountdownView(countdown);

  const headline = (() => {
    if (view.kind === "today") return "Hôm nay là ngày này 💝";
    if (view.kind === "upcoming") return `Còn ${view.diffDays} ngày`;
    // past + non-recurring → reverse count-up
    return `Đã ${Math.abs(view.diffDays)} ngày`;
  })();

  const handleDelete = () => {
    if (!confirm(`Xoá countdown "${countdown.title}"?`)) return;
    startTransition(async () => {
      const r = await deleteCountdown(countdown.id);
      if (!r.ok) toast.error(r.error ?? "Lỗi xoá");
      else toast.success("Đã xoá");
    });
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-accent text-primary mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl">
            {countdown.emoji ?? "📅"}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="leading-tight font-medium">{countdown.title}</h3>
              {countdown.is_recurring ? (
                <span
                  className="bg-accent text-accent-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  title="Lặp lại hàng năm"
                >
                  <Repeat className="h-3 w-3" />
                  hàng năm
                </span>
              ) : null}
            </div>
            <p className="text-primary text-2xl font-semibold tracking-tight">{headline}</p>
            <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {formatDateTime(view.effectiveDate.toISOString())}
              {!isOwner && createdByName ? <span>• thêm bởi {createdByName}</span> : null}
            </p>
            {countdown.note ? (
              <p className="text-muted-foreground line-clamp-2 text-sm">{countdown.note}</p>
            ) : null}
          </div>
        </div>

        {isOwner ? (
          <div className="flex gap-2 border-t pt-3">
            <Button asChild size="sm" variant="ghost">
              <Link href={`/countdowns/${countdown.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={pending}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Xoá
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
