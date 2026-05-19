import Link from "next/link";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { getNotificationCounts } from "@/lib/notifications/queries";

interface NotificationBellProps {
  userId: string;
}

/**
 * Server Component nav indicator. Loads 3 counts in parallel and links to
 * the busiest inbox. Badge displays total (capped at 9+).
 */
export async function NotificationBell({ userId }: NotificationBellProps) {
  const counts = await getNotificationCounts(userId);
  const { total, unreadPings, receivedSecrets, receivedLetters } = counts;

  // Pick the most-relevant route as click target.
  const href =
    unreadPings > 0
      ? "/pings"
      : receivedSecrets > 0
        ? "/secrets"
        : receivedLetters > 0
          ? "/letters"
          : "/pings";

  return (
    <Link
      href={href}
      aria-label={`Có ${total} thông báo`}
      className={cn(
        "border-border bg-card text-foreground hover:bg-accent relative inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
        total > 0 && "ring-primary/40 ring-2 ring-offset-1",
      )}
    >
      <Bell className="h-4 w-4" />
      {total > 0 ? (
        <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
          {total > 9 ? "9+" : total}
        </span>
      ) : null}
    </Link>
  );
}
