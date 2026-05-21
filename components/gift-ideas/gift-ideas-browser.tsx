"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatVND } from "@/lib/utils/format";
import type { GiftIdea } from "@/lib/gift-ideas/queries";

const OCCASIONS = [
  { value: "", label: "Tất cả dịp" },
  { value: "birthday", label: "Sinh nhật" },
  { value: "anniversary", label: "Kỷ niệm" },
  { value: "100-days", label: "100 ngày" },
  { value: "valentine", label: "Valentine" },
  { value: "8-3", label: "8/3" },
  { value: "20-10", label: "20/10" },
  { value: "long-distance", label: "Xa nhau" },
] as const;

const PERSONAS = [
  { value: "", label: "Tất cả" },
  { value: "student", label: "Sinh viên" },
  { value: "office-worker", label: "Đi làm" },
  { value: "long-distance", label: "Xa nhau" },
] as const;

const BUDGETS = [
  { value: "", label: "Mọi mức" },
  { value: "200000", label: "≤ 200k" },
  { value: "500000", label: "≤ 500k" },
  { value: "1000000", label: "≤ 1M" },
  { value: "2000000", label: "≤ 2M" },
] as const;

interface GiftIdeasBrowserProps {
  items: GiftIdea[];
}

export function GiftIdeasBrowser({ items }: GiftIdeasBrowserProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`/gift-ideas?${next.toString()}`));
  };

  const occasion = params.get("occasion") ?? "";
  const persona = params.get("persona") ?? "";
  const maxBudget = params.get("maxBudget") ?? "";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        <FilterSelect
          label="Dịp"
          options={OCCASIONS}
          value={occasion}
          onChange={(v) => updateParam("occasion", v)}
        />
        <FilterSelect
          label="Persona"
          options={PERSONAS}
          value={persona}
          onChange={(v) => updateParam("persona", v)}
        />
        <FilterSelect
          label="Ngân sách"
          options={BUDGETS}
          value={maxBudget}
          onChange={(v) => updateParam("maxBudget", v)}
        />
      </div>

      {(occasion || persona || maxBudget) && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{items.length} gợi ý phù hợp</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startTransition(() => router.push("/gift-ideas"))}
            disabled={pending}
          >
            Xoá lọc
          </Button>
        </div>
      )}

      {/* Grid */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Không có gợi ý phù hợp. Thử nới ngân sách hoặc đổi persona.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => {
            const hasLink = Boolean(g.affiliate_url);
            const body = (
              <Card
                className={cn(
                  "h-full transition-colors",
                  hasLink && "hover:border-primary/60 cursor-pointer",
                )}
              >
                <CardContent className="space-y-2.5 p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{g.emoji ?? "🎁"}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="leading-tight font-medium">{g.title}</h3>
                      {g.description ? (
                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                          {g.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    {g.price_min !== null ? (
                      <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 font-medium">
                        {formatVND(g.price_min)}
                        {g.price_max && g.price_max !== g.price_min
                          ? ` – ${formatVND(g.price_max)}`
                          : ""}
                      </span>
                    ) : null}
                    {g.occasion?.slice(0, 2).map((o) => (
                      <span key={o} className="border-border rounded-full border px-2 py-0.5">
                        {labelOfOccasion(o)}
                      </span>
                    ))}
                    {hasLink ? (
                      <span className="text-primary text-xs font-medium">
                        Mua trên {g.affiliate_partner ?? "shop"} →
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
            return (
              <li key={g.id}>
                {hasLink ? (
                  <a
                    href={`/gift-ideas/go/${g.id}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block"
                  >
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function labelOfOccasion(slug: string): string {
  const found = OCCASIONS.find((o) => o.value === slug);
  if (found) return found.label;
  if (slug === "random") return "Bất kỳ";
  return slug;
}

export function GiftIdeasHeader() {
  return (
    <header className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary h-5 w-5" />
        <h1 className="text-3xl font-semibold tracking-tight">Gợi ý quà</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Catalog tuyển chọn cho couple Gen Z VN — lọc theo dịp, persona, ngân sách. Click vào item
        bạn thích để biết thêm (sẽ link sang Shopee/Tiki Phase 2).
      </p>
    </header>
  );
}
