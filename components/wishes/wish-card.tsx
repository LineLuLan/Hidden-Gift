"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CheckCircle2, Circle, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { deleteWish, toggleWishFulfilled } from "@/lib/wishes/actions";
import { formatRelative } from "@/lib/utils/format";

export interface WishCardData {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  is_fulfilled: boolean;
  fulfilled_at: string | null;
  created_at: string;
}

interface WishCardProps {
  wish: WishCardData;
}

export function WishCard({ wish }: WishCardProps) {
  const [pendingToggle, startToggle] = useTransition();
  const [pendingDelete, startDelete] = useTransition();

  return (
    <Card className={cn(wish.is_fulfilled && "opacity-60")}>
      <CardContent className="flex items-start gap-3 p-4">
        <button
          type="button"
          aria-label={wish.is_fulfilled ? "Đánh dấu chưa hoàn thành" : "Đánh dấu đã hoàn thành"}
          disabled={pendingToggle}
          onClick={() => {
            startToggle(async () => {
              const result = await toggleWishFulfilled(wish.id);
              if (!result.ok) toast.error(result.error ?? "Lỗi cập nhật");
            });
          }}
          className="text-primary mt-0.5 shrink-0 hover:opacity-80"
        >
          {wish.is_fulfilled ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn("leading-tight font-medium", wish.is_fulfilled && "line-through")}>
              {wish.emoji ? <span className="mr-1.5">{wish.emoji}</span> : null}
              {wish.title}
            </h3>
            <div className="flex shrink-0 gap-0.5">
              <Button asChild variant="ghost" size="icon" aria-label="Sửa">
                <Link href={`/wishes/${wish.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Xoá"
                disabled={pendingDelete}
                onClick={() => {
                  if (!confirm("Xoá điều ước này?")) return;
                  startDelete(async () => {
                    const result = await deleteWish(wish.id);
                    if (!result.ok) toast.error(result.error ?? "Lỗi xoá");
                    else toast.success("Đã xoá");
                  });
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {wish.description ? (
            <p
              className={cn(
                "text-muted-foreground mt-1 line-clamp-3 text-sm",
                wish.is_fulfilled && "line-through",
              )}
            >
              {wish.description}
            </p>
          ) : null}
          <p className="text-muted-foreground mt-2 text-xs">
            {wish.is_fulfilled && wish.fulfilled_at
              ? `Hoàn thành ${formatRelative(wish.fulfilled_at)}`
              : `Tạo ${formatRelative(wish.created_at)}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
