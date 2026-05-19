import Link from "next/link";
import { Gift, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SecretCard, type SecretCardData } from "@/components/secrets/secret-card";
import type { Secret } from "@/lib/secrets/queries";

interface SecretListProps {
  currentUserId: string;
  partnerName: string;
  secrets: Secret[];
}

export function SecretList({ currentUserId, partnerName, secrets }: SecretListProps) {
  const myPreparing = secrets.filter(
    (s) => s.prepared_by === currentUserId && s.status !== "delivered",
  );
  const myDelivered = secrets.filter(
    (s) => s.prepared_by === currentUserId && s.status === "delivered",
  );
  const receivedFromPartner = secrets.filter(
    (s) => s.prepared_by !== currentUserId && s.status === "delivered",
  );

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Bí mật</h1>
          <p className="text-muted-foreground text-sm">
            {partnerName ? `Chuẩn bị quà cho ${partnerName}` : "Chuẩn bị quà cho partner"} — ẩn
            tuyệt đối đến khi bạn bấm &ldquo;Tặng ngay&rdquo;.
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
        emptyHint="Chưa có bí mật nào. Tạo một cái để chuẩn bị cho partner nha."
        items={myPreparing}
        render={(s) => (
          <SecretCard key={s.id} secret={toCardData(s)} isOwner={true} partnerName={partnerName} />
        )}
      />

      <Section
        title={`Bạn đã tặng ${partnerName}`}
        emptyHint="Chưa tặng bí mật nào."
        items={myDelivered}
        render={(s) => (
          <SecretCard key={s.id} secret={toCardData(s)} isOwner={true} partnerName={partnerName} />
        )}
      />

      <Section
        title={`Bạn nhận được từ ${partnerName}`}
        emptyHint="Chưa có bí mật nào được tặng cho bạn (mà bạn được phép xem)."
        items={receivedFromPartner}
        render={(s) => (
          <SecretCard key={s.id} secret={toCardData(s)} isOwner={false} partnerName={partnerName} />
        )}
      />
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
