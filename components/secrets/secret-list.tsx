import Link from "next/link";
import { Gift, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SecretCard, type SecretCardData } from "@/components/secrets/secret-card";
import type { AccountMember } from "@/lib/account/queries";
import { groupSecrets, type Secret } from "@/lib/secrets/queries";

interface SecretListProps {
  currentUserId: string;
  members: AccountMember[];
  secrets: Secret[];
  /** True when account has 3+ members (squad/family) — show squad coordination section. */
  isSquadOrFamily: boolean;
}

export function SecretList({ currentUserId, members, secrets, isSquadOrFamily }: SecretListProps) {
  const memberMap = new Map(members.map((m) => [m.user_id, m.display_name ?? "Thành viên"]));
  const grouped = groupSecrets(secrets, currentUserId);

  const partnerNameOf = (otherUserId: string) => memberMap.get(otherUserId) ?? "Thành viên";

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Bí mật</h1>
          <p className="text-muted-foreground text-sm">
            Quà bạn đang chuẩn bị — người nhận chỉ thấy sau khi bạn đánh dấu Đã tặng.
          </p>
        </div>
        <Button asChild>
          <Link href="/secrets/new">
            <Plus className="h-4 w-4" />
            Chuẩn bị bí mật
          </Link>
        </Button>
      </header>

      <Section
        title="Bạn đang chuẩn bị"
        emptyHint="Chưa có claim hay bí mật nào. Bạn có thể claim một điều ước từ trang Điều ước, hoặc tạo bí mật tự do."
        items={grouped.preparing.filter((s) => s.status !== "delivered")}
        render={(s) => (
          <SecretCard
            key={s.id}
            secret={toCardData(s)}
            perspective="preparer"
            partnerName={partnerNameOf(s.recipient_id)}
          />
        )}
      />

      <Section
        title="Bạn đã tặng"
        emptyHint="Chưa có bí mật nào được tặng."
        items={grouped.preparing.filter((s) => s.status === "delivered")}
        render={(s) => (
          <SecretCard
            key={s.id}
            secret={toCardData(s)}
            perspective="preparer"
            partnerName={partnerNameOf(s.recipient_id)}
          />
        )}
      />

      <Section
        title="Bạn nhận được"
        emptyHint="Chưa có bí mật nào được tặng cho bạn."
        items={grouped.received}
        render={(s) => (
          <SecretCard
            key={s.id}
            secret={toCardData(s)}
            perspective="recipient"
            partnerName={partnerNameOf(s.prepared_by)}
          />
        )}
      />

      {isSquadOrFamily && grouped.squadActive.length > 0 ? (
        <Section
          title="Cả nhóm đang chuẩn bị"
          emptyHint=""
          items={grouped.squadActive}
          render={(s) => (
            <SecretCard
              key={s.id}
              secret={toCardData(s)}
              perspective="squad"
              partnerName={partnerNameOf(s.prepared_by)}
            />
          )}
        />
      ) : null}
    </div>
  );
}

function toCardData(s: Secret): SecretCardData {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    status: s.status,
    reveal_at: s.reveal_at,
    delivered_at: s.delivered_at,
    created_at: s.created_at,
    updated_at: s.updated_at,
    linked_wish_id: s.linked_wish_id,
  };
}

function Section<T>({
  title,
  items,
  emptyHint,
  render,
}: {
  title: string;
  items: T[];
  emptyHint: string;
  render: (item: T) => React.ReactNode;
}) {
  if (items.length === 0 && emptyHint === "") return null;
  return (
    <section className="space-y-3">
      <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{title}</h2>
      {items.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-sm">
            <Gift className="text-muted-foreground/60 mx-auto mb-2 h-6 w-6" />
            {emptyHint}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{items.map(render)}</div>
      )}
    </section>
  );
}
