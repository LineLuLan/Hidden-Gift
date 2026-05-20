"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Tour } from "@/components/tutorial/tour";

interface TourMountProps {
  /** Server-fetched: true if account_members.tutorial_completed_at IS NULL */
  shouldAutoStart: boolean;
  userId: string;
}

/**
 * Mounts the tutorial Tour only on dashboard `/` to avoid mis-targeting selectors
 * on other pages. Uses localStorage to dampen the auto-start across the same
 * session in case user dismissed via Skip — server flag already gets set, but
 * the dampening prevents flicker on slow RPC roundtrip.
 */
export function TourMount({ shouldAutoStart, userId }: TourMountProps) {
  const pathname = usePathname();
  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    if (!shouldAutoStart) return;
    if (pathname !== "/") return;
    if (typeof window === "undefined") return;
    const dismissKey = `hg_tutorial_dismissed_${userId}`;
    if (window.localStorage.getItem(dismissKey)) return;
    // Small delay so dashboard cards render before spotlight measures positions
    const t = setTimeout(() => setAutoStart(true), 400);
    return () => clearTimeout(t);
  }, [shouldAutoStart, pathname, userId]);

  if (pathname !== "/") return null;
  return <Tour autoStart={autoStart} />;
}
