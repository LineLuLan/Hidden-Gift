import type { Metadata } from "next";

import { WishList } from "@/components/wishes/wish-list";
import { requireUser } from "@/lib/auth/server";
import { listWishes } from "@/lib/wishes/queries";

export const metadata: Metadata = { title: "Điều ước" };

export default async function WishesPage() {
  await requireUser();
  const wishes = await listWishes();
  return (
    <div className="mx-auto max-w-3xl">
      <WishList wishes={wishes} />
    </div>
  );
}
