"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Mail, Send, Pencil, Trash2, Clock, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatRelative } from "@/lib/utils/format";
import { deleteLetter, deliverLetterNow } from "@/lib/letters/actions";

export interface LetterCardData {
  id: string;
  subject: string;
  preview: string;
  scheduled_for: string;
  delivered_at: string | null;
  is_draft: boolean;
}

interface LetterCardProps {
  letter: LetterCardData;
  /** true if current user is the sender. */
  isOwner: boolean;
  partnerName: string;
}

export function LetterCard({ letter, isOwner, partnerName }: LetterCardProps) {
  const [pending, startTransition] = useTransition();
  const delivered = letter.delivered_at !== null;
  const scheduled = !delivered && !letter.is_draft;

  return (
    <Card className={cn(letter.is_draft && "opacity-80")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-accent text-primary mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
            {delivered ? (
              <CheckCheck className="h-5 w-5" />
            ) : scheduled ? (
              <Clock className="h-5 w-5" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  delivered
                    ? "bg-primary/15 text-primary"
                    : scheduled
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {delivered ? "Đã giao" : scheduled ? "Đã lên lịch" : "Nháp"}
              </span>
              <span className="text-muted-foreground text-xs">
                {isOwner ? `Gửi ${partnerName}` : `Từ ${partnerName}`}
              </span>
            </div>
            <Link
              href={
                delivered
                  ? `/letters/${letter.id}`
                  : isOwner
                    ? `/letters/${letter.id}/edit`
                    : "/letters"
              }
              className="block"
            >
              <h3 className="leading-tight font-medium hover:underline">{letter.subject}</h3>
            </Link>
            <p className="text-muted-foreground line-clamp-2 text-sm">{letter.preview}</p>
            <p className="text-muted-foreground text-xs">
              {delivered && letter.delivered_at
                ? `Giao ${formatRelative(letter.delivered_at)}`
                : `Dự kiến ${formatDateTime(letter.scheduled_for)}`}
            </p>
          </div>
        </div>

        {isOwner && !delivered ? (
          <div className="flex flex-wrap gap-2 border-t pt-3">
            {scheduled ? (
              <Button
                size="sm"
                onClick={() => {
                  if (!confirm(`Giao thư ngay cho ${partnerName}?`)) return;
                  startTransition(async () => {
                    const r = await deliverLetterNow(letter.id);
                    if (!r.ok) toast.error(r.error ?? "Lỗi giao");
                    else toast.success("Đã giao thư");
                  });
                }}
                disabled={pending}
              >
                <Send className="h-4 w-4" />
                Giao ngay
              </Button>
            ) : null}
            <Button asChild size="sm" variant="ghost">
              <Link href={`/letters/${letter.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Sửa
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (!confirm("Xoá thư này?")) return;
                startTransition(async () => {
                  const r = await deleteLetter(letter.id);
                  if (!r.ok) toast.error(r.error ?? "Lỗi xoá");
                  else toast.success("Đã xoá");
                });
              }}
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
