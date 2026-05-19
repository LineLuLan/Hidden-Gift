import { AppShell } from "@/components/layouts/app-shell";
import { PingListener } from "@/components/pings/ping-listener";
import { requireAccount, requireUser } from "@/lib/auth/server";
import { getAccountDetail, getPartner, isPartnerLinked } from "@/lib/account/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const account = await requireAccount();
  const detail = await getAccountDetail(account.accountId);

  const displayName = account.displayName ?? (user.email ? user.email.split("@")[0] : "Bạn");

  const partner = detail && isPartnerLinked(detail) ? getPartner(detail, user.id) : null;
  const partnerName = partner?.display_name ?? "Partner";

  return (
    <AppShell displayName={displayName ?? "Bạn"}>
      {partner ? <PingListener userId={user.id} partnerName={partnerName} /> : null}
      {children}
    </AppShell>
  );
}
