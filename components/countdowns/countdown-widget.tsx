import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { computeCountdownView, type Countdown } from "@/lib/countdowns/view";

interface CountdownWidgetProps {
  countdowns: Countdown[];
}

/**
 * Dashboard widget — surfaces the nearest upcoming countdown.
 * Shows nothing if user has no countdowns yet (returns inline "create first" prompt).
 */
export function CountdownWidget({ countdowns }: CountdownWidgetProps) {
  if (countdowns.length === 0) {
    return (
      <Link href="/countdowns/new" className="block">
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-accent text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Thêm ngày kỷ niệm đầu tiên</p>
              <p className="text-muted-foreground text-xs">
                Ngày yêu nhau, sinh nhật, hay bất kỳ dịp đặc biệt nào.
              </p>
            </div>
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  const enriched = countdowns.map((c) => ({ c, view: computeCountdownView(c) }));
  enriched.sort((a, b) => {
    const orderA = a.view.kind === "today" ? 0 : a.view.kind === "upcoming" ? 1 : 2;
    const orderB = b.view.kind === "today" ? 0 : b.view.kind === "upcoming" ? 1 : 2;
    if (orderA !== orderB) return orderA - orderB;
    return a.view.effectiveDate.getTime() - b.view.effectiveDate.getTime();
  });
  const nearest = enriched[0];
  if (!nearest) return null;

  const headline = (() => {
    if (nearest.view.kind === "today") return "Hôm nay là ngày này 💝";
    if (nearest.view.kind === "upcoming") return `Còn ${nearest.view.diffDays} ngày`;
    return `Đã ${Math.abs(nearest.view.diffDays)} ngày`;
  })();

  return (
    <Link href="/countdowns" className="block">
      <Card className="hover:border-primary/40 transition-colors" data-tutorial="countdown-widget">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="bg-accent text-primary inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl">
            {nearest.c.emoji ?? "📅"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">{nearest.c.title}</p>
            <p className="text-primary text-2xl font-semibold tracking-tight">{headline}</p>
          </div>
          <ChevronRight className="text-muted-foreground h-4 w-4" />
        </CardContent>
      </Card>
    </Link>
  );
}
