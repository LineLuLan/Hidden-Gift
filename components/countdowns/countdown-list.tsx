import Link from "next/link";
import { Calendar, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownCard } from "@/components/countdowns/countdown-card";
import type { AccountMember } from "@/lib/account/queries";
import { computeCountdownView, type Countdown } from "@/lib/countdowns/view";

interface CountdownListProps {
  countdowns: Countdown[];
  currentUserId: string;
  members: AccountMember[];
  /** Free-tier cap (current user's count). */
  myCount: number;
  /** Free-tier limit; if reached, "Create" button disabled. */
  maxAllowed: number;
}

export function CountdownList({
  countdowns,
  currentUserId,
  members,
  myCount,
  maxAllowed,
}: CountdownListProps) {
  const nameByUserId = new Map(
    members.map((m) => [m.user_id, m.display_name ?? "Thành viên"] as const),
  );

  // Sort: upcoming (nearest first) → today → past
  const enriched = countdowns.map((c) => ({ c, view: computeCountdownView(c) }));
  enriched.sort((a, b) => {
    const orderA = a.view.kind === "today" ? 0 : a.view.kind === "upcoming" ? 1 : 2;
    const orderB = b.view.kind === "today" ? 0 : b.view.kind === "upcoming" ? 1 : 2;
    if (orderA !== orderB) return orderA - orderB;
    return a.view.effectiveDate.getTime() - b.view.effectiveDate.getTime();
  });

  const canCreate = myCount < maxAllowed;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Lịch kỷ niệm</h1>
          <p className="text-muted-foreground text-sm">
            Đếm ngày tới sinh nhật, kỷ niệm, hoặc các dịp đặc biệt của nhóm. Lặp lại tự động sang
            năm sau khi đến nơi.
          </p>
        </div>
        <Button asChild disabled={!canCreate}>
          <Link
            href={canCreate ? "/countdowns/new" : "#"}
            aria-disabled={!canCreate}
            className={!canCreate ? "pointer-events-none" : undefined}
          >
            <Plus className="h-4 w-4" />
            Thêm
          </Link>
        </Button>
      </header>

      <p className="text-muted-foreground text-xs">
        {myCount}/{Number.isFinite(maxAllowed) && maxAllowed < 999 ? maxAllowed : "∞"} countdown của
        bạn.
        {!canCreate ? " Lên Pro để không giới hạn ⏳" : null}
      </p>

      {enriched.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-full">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="font-medium">Chưa có lịch nào</p>
            <p className="text-muted-foreground text-sm">
              Thêm ngày yêu nhau / sinh nhật để đếm ngày cùng nhau.
            </p>
            <Button asChild className="mt-2">
              <Link href="/countdowns/new">
                <Plus className="h-4 w-4" />
                Thêm lịch đầu tiên
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {enriched.map(({ c }) => (
            <CountdownCard
              key={c.id}
              countdown={c}
              isOwner={c.created_by === currentUserId}
              createdByName={nameByUserId.get(c.created_by)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
