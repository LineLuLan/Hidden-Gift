import { AppShell } from "@/components/layouts/app-shell";
import { requireAccount, requireUser } from "@/lib/auth/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const account = await requireAccount();

  const displayName = account.displayName ?? (user.email ? user.email.split("@")[0] : "Bạn");

  return <AppShell displayName={displayName ?? "Bạn"}>{children}</AppShell>;
}
