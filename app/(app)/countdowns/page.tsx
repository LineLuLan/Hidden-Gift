import type { Metadata } from "next";

import { CountdownList } from "@/components/countdowns/countdown-list";
import { getAccountDetail } from "@/lib/account/queries";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { countCountdowns, listCountdowns } from "@/lib/countdowns/queries";
import { getLimits } from "@/lib/subscription/limits";

export const metadata: Metadata = { title: "Lịch kỷ niệm" };

export default async function CountdownsPage() {
  const user = await requireUser();
  const account = await requireAccount();

  const [countdowns, detail, myCount, limits] = await Promise.all([
    listCountdowns(),
    getAccountDetail(account.accountId),
    countCountdowns(user.id),
    getLimits(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <CountdownList
        countdowns={countdowns}
        currentUserId={user.id}
        members={detail?.members ?? []}
        myCount={myCount}
        maxAllowed={limits.countdowns}
      />
    </div>
  );
}
