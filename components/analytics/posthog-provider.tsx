"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { env, features } from "@/lib/env";

interface PostHogClient {
  init(key: string, opts: Record<string, unknown>): void;
  capture(event: string, properties?: Record<string, unknown>): void;
  identify(distinctId: string, properties?: Record<string, unknown>): void;
  reset(): void;
}

let client: PostHogClient | null = null;

async function ensureClient(): Promise<PostHogClient | null> {
  if (!features.posthog) return null;
  if (client) return client;
  const mod = await import("posthog-js");
  const ph = mod.default as unknown as PostHogClient;
  ph.init(env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // We dispatch manually below
    capture_pageleave: true,
    persistence: "localStorage",
    autocapture: false,
  });
  client = ph;
  return ph;
}

/**
 * Client analytics gate. Auto-tracks pageviews on route change.
 * No-ops entirely when features.posthog is false.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    void ensureClient().then(() => {
      initialized.current = true;
    });
  }, []);

  useEffect(() => {
    if (!features.posthog || !initialized.current) return;
    const url = pathname + (searchParams.size > 0 ? "?" + searchParams.toString() : "");
    void ensureClient().then((ph) => {
      ph?.capture("$pageview", { $current_url: url });
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}

/** Fire a custom event from a Client Component. */
export async function trackEvent(event: string, properties?: Record<string, unknown>) {
  const ph = await ensureClient();
  ph?.capture(event, properties);
}
