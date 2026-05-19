import type { Metadata } from "next";

import { GiftIdeasBrowser, GiftIdeasHeader } from "@/components/gift-ideas/gift-ideas-browser";
import { requireUser } from "@/lib/auth/server";
import {
  listGiftIdeas,
  type GiftIdeaFilters,
  type Persona,
  type Occasion,
} from "@/lib/gift-ideas/queries";

export const metadata: Metadata = { title: "Gợi ý quà" };

interface GiftIdeasPageProps {
  searchParams: Promise<{
    occasion?: string;
    persona?: string;
    maxBudget?: string;
  }>;
}

const VALID_OCCASIONS: Occasion[] = [
  "birthday",
  "anniversary",
  "100-days",
  "valentine",
  "8-3",
  "20-10",
  "long-distance",
  "random",
];
const VALID_PERSONAS: Persona[] = ["student", "office-worker", "long-distance"];

export default async function GiftIdeasPage({ searchParams }: GiftIdeasPageProps) {
  await requireUser();
  const sp = await searchParams;

  const filters: GiftIdeaFilters = {};
  if (sp.occasion && VALID_OCCASIONS.includes(sp.occasion as Occasion)) {
    filters.occasion = sp.occasion as Occasion;
  }
  if (sp.persona && VALID_PERSONAS.includes(sp.persona as Persona)) {
    filters.persona = sp.persona as Persona;
  }
  if (sp.maxBudget) {
    const n = Number(sp.maxBudget);
    if (!Number.isNaN(n) && n > 0) filters.maxBudget = n;
  }

  const items = await listGiftIdeas(filters);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <GiftIdeasHeader />
      <GiftIdeasBrowser items={items} />
    </div>
  );
}
