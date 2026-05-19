"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

interface RealtimeToastsProps {
  /** Current user id — filter so we only toast events targeted at us. */
  userId: string;
  partnerName: string;
}

/**
 * Subscribes to 3 Supabase Realtime streams for the current user:
 *  - emoji_pings INSERT      → "<emoji> partner gửi"
 *  - secrets UPDATE          → "🎁 partner đã tặng bạn bí mật" (when status flips to delivered)
 *  - letters UPDATE          → "✉️ thư mới từ partner" (when delivered_at becomes non-null)
 *
 * Filtering happens server-side via `recipient_id=eq.<userId>`. The callback
 * still double-checks the new row to ensure we toast only on the relevant
 * state transition (UPDATE fires on any field change).
 */
export function RealtimeToasts({ userId, partnerName }: RealtimeToastsProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const recipientFilter = `recipient_id=eq.${userId}`;

    const channel = supabase
      .channel("realtime-inbox")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "emoji_pings",
          filter: recipientFilter,
        },
        (payload) => {
          const row = payload.new as { emoji?: string; message?: string | null };
          const emoji = row.emoji ?? "💝";
          const message = row.message ? ` — ${row.message}` : "";
          toast(`${emoji} ${partnerName}${message}`, { duration: 6000 });
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "secrets",
          filter: recipientFilter,
        },
        (payload) => {
          const row = payload.new as { status?: string; title?: string };
          if (row.status !== "delivered") return;
          toast(`🎁 ${partnerName} đã tặng bạn: ${row.title ?? "một bí mật"}`, {
            duration: 8000,
          });
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "letters",
          filter: recipientFilter,
        },
        (payload) => {
          const row = payload.new as { delivered_at?: string | null; subject?: string };
          if (!row.delivered_at) return;
          toast(`✉️ Thư mới từ ${partnerName}: ${row.subject ?? ""}`, {
            duration: 8000,
          });
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, partnerName, router]);

  return null;
}
