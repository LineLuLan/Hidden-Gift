"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Gift, Sparkles, Trash2, Pencil, CheckCircle2, Send, Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatRelative, formatDateTime } from "@/lib/utils/format";
import { deleteSecret, markDelivered, markReady } from "@/lib/secrets/actions";

export interface SecretCardData {
  id: string;
  title: string;
  description: string | null;
  status: "preparing" | "ready" | "delivered";
  reveal_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  linked_wish_id: string | null;
}

interface SecretCardProps {
  secret: SecretCardData;
  /**
   * Perspective of the current viewer:
   *   "preparer" — I am prepared_by, I can mark ready/delivered/delete
   *   "recipient" — I received this (delivered) — read-only
   *   "squad" — I am another member watching the claim (read-only, no actions)
   */
  perspective: "preparer" | "recipient" | "squad";
  /** Display name of the OTHER party (recipient if I'm preparer; preparer if I'm recipient). */
  partnerName: string;
}

const STATUS_BADGE: Record<SecretCardData["status"], { label: string; tone: string }> = {
  preparing: { label: "Đang chuẩn bị", tone: "bg-muted text-muted-foreground" },
  ready: { label: "Sẵn sàng tặng", tone: "bg-accent text-accent-foreground" },
  delivered: { label: "Đã tặng", tone: "bg-primary/15 text-primary" },
};

export function SecretCard({ secret, perspective, partnerName }: SecretCardProps) {
  const [pending, startTransition] = useTransition();
  const badge = STATUS_BADGE[secret.status];

  const handleReady = () => {
    startTransition(async () => {
      const r = await markReady(secret.id);
      if (!r.ok) toast.error(r.error ?? "Lỗi cập nhật");
      else toast.success("Đánh dấu Sẵn sàng tặng");
    });
  };

  const handleDeliver = () => {
    if (!confirm(`Đánh dấu đã tặng cho ${partnerName}? ${partnerName} sẽ thấy ngay sau đó.`))
      return;
    startTransition(async () => {
      const r = await markDelivered(secret.id);
      if (!r.ok) toast.error(r.error ?? "Lỗi giao");
      else toast.success(`Đã tặng cho ${partnerName} 🎁`);
    });
  };

  const handleDelete = () => {
    if (!confirm("Xoá bí mật này? Không hoàn tác được.")) return;
    startTransition(async () => {
      const r = await deleteSecret(secret.id);
      if (!r.ok) toast.error(r.error ?? "Lỗi xoá");
      else toast.success("Đã xoá");
    });
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-accent text-primary mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
            {secret.status === "delivered" ? (
              <Sparkles className="h-5 w-5" />
            ) : (
              <Gift className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", badge.tone)}>
                {badge.label}
              </span>
              <span className="text-muted-foreground text-xs">
                {perspective === "preparer"
                  ? `Tặng ${partnerName}`
                  : perspective === "recipient"
                    ? `Từ ${partnerName}`
                    : `${partnerName} đang chuẩn bị`}
              </span>
            </div>
            <h3 className="leading-tight font-medium">{secret.title}</h3>
            {secret.linked_wish_id ? (
              <p className="text-primary inline-flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3" />
                Từ điều ước
              </p>
            ) : null}
            {secret.description ? (
              <p className="text-muted-foreground line-clamp-3 text-sm">{secret.description}</p>
            ) : null}
            <p className="text-muted-foreground text-xs">
              {secret.status === "delivered" && secret.delivered_at
                ? `Đã tặng ${formatRelative(secret.delivered_at)}`
                : secret.reveal_at
                  ? `Hẹn ngày ${formatDateTime(secret.reveal_at)}`
                  : `Cập nhật ${formatRelative(secret.updated_at)}`}
            </p>
          </div>
        </div>

        {perspective === "preparer" && secret.status !== "delivered" ? (
          <div className="flex flex-wrap gap-2 border-t pt-3">
            {secret.status === "preparing" ? (
              <Button size="sm" variant="outline" onClick={handleReady} disabled={pending}>
                <CheckCircle2 className="h-4 w-4" />
                Đánh dấu Sẵn sàng
              </Button>
            ) : null}
            <Button size="sm" onClick={handleDeliver} disabled={pending}>
              <Send className="h-4 w-4" />
              Đánh dấu đã tặng
            </Button>
            {/* Free-form secrets can be edited; linked-wish claims auto-derive title */}
            {secret.linked_wish_id ? null : (
              <Button asChild size="sm" variant="ghost">
                <Link href={`/secrets/${secret.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Sửa
                </Link>
              </Button>
            )}
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
