import type { Metadata } from "next";

import { WishList } from "@/components/wishes/wish-list";
import { getAccountDetail } from "@/lib/account/queries";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { countActiveWishes, getClaimStatusMap, listWishes } from "@/lib/wishes/queries";

export const metadata: Metadata = { title: "Điều ước" };

export default async function WishesPage() {
  const user = await requireUser();
  const account = await requireAccount();

  const [wishes, detail, myActiveCount] = await Promise.all([
    listWishes(),
    getAccountDetail(account.accountId),
    countActiveWishes(user.id),
  ]);

  const otherOwnerWishIds = wishes.filter((w) => w.user_id !== user.id).map((w) => w.id);
  const claimStatusByWishId = await getClaimStatusMap(otherOwnerWishIds, user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <WishList
        wishes={wishes}
        currentUserId={user.id}
        members={detail?.members ?? []}
        myActiveCount={myActiveCount}
        claimStatusByWishId={claimStatusByWishId}
      />
    </div>
  );
}
