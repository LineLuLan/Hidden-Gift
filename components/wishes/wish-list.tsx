import Link from "next/link";
import { Heart, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WishCard } from "@/components/wishes/wish-card";
import { FREE_TIER_WISH_LIMIT, type Wish } from "@/lib/wishes/queries";

interface WishListProps {
  wishes: Wish[];
  displayName?: string;
}

export function WishList({ wishes, displayName }: WishListProps) {
  const activeCount = wishes.filter((w) => !w.is_fulfilled).length;
  const canCreate = activeCount < FREE_TIER_WISH_LIMIT;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Điều ước của bạn</h1>
          <p className="text-muted-foreground text-sm">
            Riêng tư hoàn toàn — partner không thấy danh sách này, kể cả khi truy cập trực tiếp
            database.
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
        {activeCount}/{FREE_TIER_WISH_LIMIT} điều ước đang chờ (Free tier).
        {!canCreate ? " Hoàn thành 1 cái để tạo thêm." : null}
      </p>

      {wishes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Heart className="h-6 w-6" />
            </div>
            <p className="font-medium">Chưa có điều ước nào</p>
            <p className="text-muted-foreground text-sm">
              Ghi xuống điều bạn mong nhận — có thể là quà sinh nhật, một chuyến đi, hoặc đơn giản
              là một buổi sáng có hoa.
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
          {wishes.map((wish) => (
            <WishCard
              key={wish.id}
              displayName={displayName}
              wish={{
                id: wish.id,
                title: wish.title,
                description: wish.description,
                emoji: wish.emoji,
                is_fulfilled: wish.is_fulfilled,
                fulfilled_at: wish.fulfilled_at,
                created_at: wish.created_at,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
