"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

interface PingListenerProps {
  /** Current user id — only show toast for pings WHERE recipient_id = userId. */
  userId: string;
  partnerName: string;
}

/**
 * Subscribes to Supabase Realtime INSERT events on emoji_pings.
 * Filtered client-side because Realtime channel filters don't support per-row predicates
 * cheaply — RLS still ensures we only RECEIVE pings where we are the recipient.
 */
export function PingListener({ userId, partnerName }: PingListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("emoji-pings-inbox")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "emoji_pings",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { emoji?: string; message?: string | null };
          const emoji = row.emoji ?? "💝";
          const message = row.message ? ` — ${row.message}` : "";
          toast(`${emoji} ${partnerName} gửi cho bạn${message}`, {
            duration: 6000,
          });
          // Refresh server-component data so /pings list updates if user is on that page
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
