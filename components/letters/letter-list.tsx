import Link from "next/link";
import { Mail, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LetterCard, type LetterCardData } from "@/components/letters/letter-card";
import type { AccountMember } from "@/lib/account/queries";
import { getLetterText, type Letter } from "@/lib/letters/queries";

interface LetterListProps {
  currentUserId: string;
  members: AccountMember[];
  letters: Letter[];
}

export function LetterList({ currentUserId, members, letters }: LetterListProps) {
  const nameByUserId = new Map(
    members.map((m) => [m.user_id, m.display_name ?? "Thành viên"] as const),
  );
  const getName = (id: string) => nameByUserId.get(id) ?? "Thành viên";

  const drafts = letters.filter(
    (l) => l.sender_id === currentUserId && l.is_draft && !l.delivered_at,
  );
  const scheduled = letters.filter(
    (l) => l.sender_id === currentUserId && !l.is_draft && !l.delivered_at,
  );
  const sent = letters.filter((l) => l.sender_id === currentUserId && l.delivered_at);
  const received = letters.filter((l) => l.recipient_id === currentUserId && l.delivered_at);

  const renderOwnerCard = (l: Letter) => (
    <LetterCard
      key={l.id}
      letter={toCardData(l)}
      isOwner={true}
      otherPartyName={getName(l.recipient_id)}
    />
  );

  const renderReceivedCard = (l: Letter) => (
    <LetterCard
      key={l.id}
      letter={toCardData(l)}
      isOwner={false}
      otherPartyName={getName(l.sender_id)}
    />
  );

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Thư hẹn giờ</h1>
          <p className="text-muted-foreground text-sm">
            Viết thư giao vào ngày bạn chọn — người nhận chỉ thấy sau khi đã giao.
          </p>
        </div>
        <Button asChild>
          <Link href="/letters/new">
            <Plus className="h-4 w-4" />
            Viết thư
          </Link>
        </Button>
      </header>

      <Section title="Nháp" emptyHint="Không có thư nháp." items={drafts}>
        {renderOwnerCard}
      </Section>

      <Section title="Đã lên lịch" emptyHint="Chưa có thư nào được lên lịch." items={scheduled}>
        {renderOwnerCard}
      </Section>

      <Section title="Đã giao" emptyHint="Chưa giao thư nào." items={sent}>
        {renderOwnerCard}
      </Section>

      <Section
        title="Thư bạn nhận được"
        emptyHint="Chưa có thư nào được giao tới bạn."
        items={received}
      >
        {renderReceivedCard}
      </Section>
    </div>
  );
}

function toCardData(l: Letter): LetterCardData {
  return {
    id: l.id,
    subject: l.subject,
    preview: getLetterText(l).slice(0, 200),
    scheduled_for: l.scheduled_for,
    delivered_at: l.delivered_at,
    is_draft: l.is_draft,
  };
}

function Section<T>({
  title,
  items,
  emptyHint,
  children,
}: {
  title: string;
  items: T[];
  emptyHint: string;
  children: (item: T) => React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{title}</h2>
      {items.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-6 text-center text-sm">
            <Mail className="text-muted-foreground/60 mx-auto mb-2 h-6 w-6" />
            {emptyHint}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{items.map(children)}</div>
      )}
    </section>
  );
}
