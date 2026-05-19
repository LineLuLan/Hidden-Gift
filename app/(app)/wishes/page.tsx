import type { Metadata } from "next";

import { WishList } from "@/components/wishes/wish-list";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { listWishes } from "@/lib/wishes/queries";

export const metadata: Metadata = { title: "Điều ước" };

export default async function WishesPage() {
  await requireUser();
  const account = await requireAccount();
  const wishes = await listWishes();
  return (
    <div className="mx-auto max-w-3xl">
      <WishList wishes={wishes} displayName={account.displayName ?? undefined} />
    </div>
  );
}
