"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/format";
import { markAllPingsRead } from "@/lib/pings/actions";
import type { AccountMember } from "@/lib/account/queries";
import type { EmojiPing } from "@/lib/pings/queries";

interface PingListProps {
  pings: EmojiPing[];
  currentUserId: string;
  members: AccountMember[];
}

export function PingList({ pings, currentUserId, members }: PingListProps) {
  const nameByUserId = new Map(
    members.map((m) => [m.user_id, m.display_name ?? "Thành viên"] as const),
  );
  const getName = (id: string) => nameByUserId.get(id) ?? "Thành viên";
  const [pending, startTransition] = useTransition();
  const unreadCount = pings.filter(
    (p) => p.recipient_id === currentUserId && p.read_at === null,
  ).length;

  if (pings.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          Chưa có ping nào. Gửi một emoji để bắt đầu nhé.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">{unreadCount} ping chưa đọc</p>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const r = await markAllPingsRead();
                if (!r.ok) toast.error(r.error ?? "Lỗi");
                else toast.success("Đã đánh dấu tất cả là đã đọc");
              });
            }}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
      ) : null}

      <ul className="space-y-2">
        {pings.map((ping) => {
          const fromMe = ping.sender_id === currentUserId;
          const unread = ping.recipient_id === currentUserId && ping.read_at === null;
          return (
            <li key={ping.id}>
              <Card className={cn(unread && "border-primary/50")}>
                <CardContent className="flex items-start gap-3 p-3">
                  <span className="text-3xl leading-none">{ping.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-medium">
                        {fromMe
                          ? `Bạn → ${getName(ping.recipient_id)}`
                          : `${getName(ping.sender_id)} → Bạn`}
                      </p>
                      {unread ? (
                        <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-[10px]">
                          MỚI
                        </span>
                      ) : null}
                    </div>
                    {ping.message ? (
                      <p className="text-foreground/90 mt-0.5 text-sm">{ping.message}</p>
                    ) : null}
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatRelative(ping.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
