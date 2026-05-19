/**
 * @file sentry.client.config.ts
 * @description Client-side Sentry init. Loaded by @sentry/nextjs build hooks
 *              when SENTRY_DSN is set; otherwise this file is inert.
 */

import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    ignoreErrors: ["NEXT_REDIRECT", "NEXT_NOT_FOUND"],
  });
}
