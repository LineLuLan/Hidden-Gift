/**
 * @file instrumentation.ts
 * @description Next.js instrumentation hook. Wires Sentry when SENTRY_DSN is
 *              present; no-op otherwise (development without observability keys).
 *              Runs once per server runtime startup (node + edge).
 */

export async function register() {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  const Sentry = await import("@sentry/nextjs");

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: 0,
      // Filter expected user-facing errors away from the issue tracker.
      ignoreErrors: ["NEXT_REDIRECT", "NEXT_NOT_FOUND", /^Rate limit exceeded/i],
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    });
  }
}

/**
 * Forward errors thrown in async server requests to Sentry. Required by Next.js
 * 15+ to capture errors that escape error.tsx boundaries.
 */
export async function onRequestError(error: unknown, request: unknown, context: unknown) {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  // Sentry's request/context types are version-dependent; we trust Next.js to
  // pass shapes that match the installed @sentry/nextjs version.
  (Sentry.captureRequestError as (e: unknown, r: unknown, c: unknown) => void)(
    error,
    request,
    context,
  );
}
