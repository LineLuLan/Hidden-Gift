"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Trash2, Pencil, Share2, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClaimButton } from "@/components/wishes/claim-button";
import { cn } from "@/lib/utils/cn";
import { deleteWish, toggleWishFulfilled } from "@/lib/wishes/actions";
import { formatRelative } from "@/lib/utils/format";
import { WishShareDialog } from "@/components/wishes/wish-share-dialog";

export interface WishCardData {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  is_fulfilled: boolean;
  fulfilled_at: string | null;
  created_at: string;
}

export interface ClaimInfo {
  /** secret_id of THIS user's active claim, if any */
  myClaimSecretId?: string;
  /** Name of any OTHER member who claimed (display only — first one wins) */
  otherClaimerName?: string;
  /** ISO timestamp of the earliest claim by someone else */
  otherClaimedAt?: string;
}

interface WishCardProps {
  wish: WishCardData;
  /** display_name for share watermark and "owned by" caption */
  displayName?: string;
  /** True if current user owns this wish (can edit / can't see claim info) */
  isOwner: boolean;
  /** Non-owner only: claim/coordination status. Owner sees nothing about claims. */
  claim?: ClaimInfo;
}

export function WishCard({ wish, displayName, isOwner, claim }: WishCardProps) {
  const [pendingToggle, startToggle] = useTransition();
  const [pendingDelete, startDelete] = useTransition();
  const [shareOpen, setShareOpen] = useState(false);

  const someoneElseClaimed = Boolean(claim?.otherClaimerName);

  return (
    <Card className={cn(wish.is_fulfilled && "opacity-60")}>
      <CardContent className="flex items-start gap-3 p-4">
        {isOwner ? (
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
        ) : (
          <div className="bg-accent text-primary mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
            {wish.is_fulfilled ? (
              <Sparkles className="h-5 w-5" />
            ) : someoneElseClaimed || claim?.myClaimSecretId ? (
              <UserCheck className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn("leading-tight font-medium", wish.is_fulfilled && "line-through")}>
              {wish.emoji ? <span className="mr-1.5">{wish.emoji}</span> : null}
              {wish.title}
            </h3>
            {isOwner ? (
              <div className="flex shrink-0 gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Chia sẻ"
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
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
            ) : null}
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

          {!isOwner && !wish.is_fulfilled ? (
            <div className="mt-3 space-y-2 border-t pt-3">
              {claim?.myClaimSecretId ? (
                <p className="text-primary text-xs font-medium">
                  ✓ Bạn đang chuẩn bị món này — bí mật của bạn 🤫
                </p>
              ) : claim?.otherClaimerName ? (
                <p className="text-muted-foreground text-xs">
                  {claim.otherClaimerName} đã chọn món này{" "}
                  {claim.otherClaimedAt ? formatRelative(claim.otherClaimedAt) : ""}
                </p>
              ) : null}
              <ClaimButton
                wishId={wish.id}
                myClaimSecretId={claim?.myClaimSecretId}
                someoneElseClaimed={someoneElseClaimed}
              />
            </div>
          ) : null}
        </div>
      </CardContent>
      {isOwner ? (
        <WishShareDialog
          wish={{
            title: wish.title,
            description: wish.description,
            emoji: wish.emoji,
            displayName: displayName ?? "Mình",
          }}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </Card>
  );
}
