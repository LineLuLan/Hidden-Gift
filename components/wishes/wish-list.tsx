import Link from "next/link";
import { Heart, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WishCard, type ClaimInfo } from "@/components/wishes/wish-card";
import type { AccountMember } from "@/lib/account/queries";
import { FREE_TIER_WISH_LIMIT, type Wish, type WishClaimStatus } from "@/lib/wishes/queries";

interface WishListProps {
  wishes: Wish[];
  currentUserId: string;
  members: AccountMember[];
  /** Free-tier counter (current user's active wishes only). */
  myActiveCount: number;
  /** Claim status by wish id (only populated for non-owner wishes). */
  claimStatusByWishId: Map<string, WishClaimStatus>;
}

export function WishList({
  wishes,
  currentUserId,
  members,
  myActiveCount,
  claimStatusByWishId,
}: WishListProps) {
  const canCreate = myActiveCount < FREE_TIER_WISH_LIMIT;

  const myWishes = wishes.filter((w) => w.user_id === currentUserId);
  const otherWishesByOwner = groupBy(
    wishes.filter((w) => w.user_id !== currentUserId),
    (w) => w.user_id,
  );

  const memberById = new Map(members.map((m) => [m.user_id, m] as const));
  const myDisplayName = memberById.get(currentUserId)?.display_name ?? undefined;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Điều ước</h1>
          <p className="text-muted-foreground text-sm">
            Cả nhóm thấy chung; nhưng ai âm thầm chuẩn bị thì{" "}
            <span className="text-foreground font-medium">người được tặng không biết</span> đến lúc
            mở quà.
          </p>
        </div>
        <Button asChild disabled={!canCreate}>
          <Link
            href={canCreate ? "/wishes/new" : "#"}
            aria-disabled={!canCreate}
            className={!canCreate ? "pointer-events-none" : undefined}
          >
            <Plus className="h-4 w-4" />
            Tạo điều ước
          </Link>
        </Button>
      </header>

      <p className="text-muted-foreground text-xs">
        {myActiveCount}/{FREE_TIER_WISH_LIMIT} điều ước của bạn đang chờ (Free tier).
        {!canCreate ? " Hoàn thành 1 cái để tạo thêm." : null}
      </p>

      <section className="space-y-3">
        <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Điều ước của bạn
        </h2>
        {myWishes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
                <Heart className="h-6 w-6" />
              </div>
              <p className="font-medium">Chưa có điều ước nào</p>
              <p className="text-muted-foreground text-sm">
                Ghi xuống điều bạn mong nhận — sẽ không ai đoán được ai sẽ chuẩn bị.
              </p>
              <Button asChild className="mt-2">
                <Link href="/wishes/new">
                  <Plus className="h-4 w-4" />
                  Tạo điều ước đầu tiên
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {myWishes.map((w) => (
              <WishCard
                key={w.id}
                isOwner={true}
                displayName={myDisplayName ?? undefined}
                wish={{
                  id: w.id,
                  title: w.title,
                  description: w.description,
                  emoji: w.emoji,
                  is_fulfilled: w.is_fulfilled,
                  fulfilled_at: w.fulfilled_at,
                  created_at: w.created_at,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {Array.from(otherWishesByOwner.entries()).map(([ownerId, ownerWishes]) => {
        const member = memberById.get(ownerId);
        const ownerName = member?.display_name ?? "Thành viên";
        return (
          <section key={ownerId} className="space-y-3">
            <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Điều ước của {ownerName}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ownerWishes.map((w) => {
                const status = claimStatusByWishId.get(w.id);
                const myClaim = status?.claims.find((c) => c.preparedBy === currentUserId);
                const otherClaim = status?.claims.find((c) => c.preparedBy !== currentUserId);
                const otherClaimer = otherClaim
                  ? (memberById.get(otherClaim.preparedBy)?.display_name ?? "Ai đó")
                  : undefined;
                const claim: ClaimInfo = {
                  myClaimSecretId: myClaim?.secretId,
                  otherClaimerName: otherClaimer,
                  otherClaimedAt: otherClaim?.claimedAt,
                };
                return (
                  <WishCard
                    key={w.id}
                    isOwner={false}
                    displayName={ownerName}
                    wish={{
                      id: w.id,
                      title: w.title,
                      description: w.description,
                      emoji: w.emoji,
                      is_fulfilled: w.is_fulfilled,
                      fulfilled_at: w.fulfilled_at,
                      created_at: w.created_at,
                    }}
                    claim={claim}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (existing) existing.push(item);
    else map.set(key, [item]);
  }
  return map;
}
