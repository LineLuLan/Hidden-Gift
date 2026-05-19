/**
 * @file lib/analytics/server.ts
 * @description Server-side PostHog event capture (Server Actions, Route Handlers).
 *              No-op when NEXT_PUBLIC_POSTHOG_KEY missing.
 */

import "server-only";

import { env, features } from "@/lib/env";

/**
 * Fire a single PostHog event from the server. Uses fetch directly to avoid
 * loading posthog-node dep — payload is tiny.
 */
export async function captureServerEvent(params: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  if (!features.posthog) return;
  try {
    await fetch(env.NEXT_PUBLIC_POSTHOG_HOST + "/i/v0/e/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: env.NEXT_PUBLIC_POSTHOG_KEY,
        distinct_id: params.distinctId,
        event: params.event,
        properties: {
          ...params.properties,
          $lib: "hidden-gift-server",
        },
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // Best-effort — never block the user flow on analytics failure
    console.warn("[analytics] capture failed:", err);
  }
}
