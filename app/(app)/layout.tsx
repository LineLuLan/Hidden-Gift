import { AppShell } from "@/components/layouts/app-shell";
import { NotificationBell } from "@/components/layouts/notification-bell";
import { RealtimeToasts } from "@/components/shared/realtime-toasts";
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
    <AppShell
      displayName={displayName ?? "Bạn"}
      notificationSlot={<NotificationBell userId={user.id} />}
    >
      {partner ? <RealtimeToasts userId={user.id} partnerName={partnerName} /> : null}
      {children}
    </AppShell>
  );
}
