/**
 * @file lib/env.ts
 * @description Zod-validated environment variables. Required keys throw at boot;
 *              optional keys log a warning and disable the matching feature flag.
 * @phase 0/1
 */

import { z } from "zod";

// Empty strings in .env.local are treated as "not set" — Zod's .optional()
// alone would still see "" as a value and fail .url()/.email() validation.
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

// ─── Schemas ───────────────────────────────────────────────────────────────

const serverSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Supabase (REQUIRED)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "Supabase service_role key missing"),
  SUPABASE_PROJECT_REF: z.string().min(10, "Supabase project ref missing"),
  SUPABASE_DB_PASSWORD: z.string().min(8, "Supabase DB password missing"),

  // Better-Auth (REQUIRED)
  BETTER_AUTH_SECRET: z.string().min(32, "Better-Auth secret must be 32+ chars"),
  BETTER_AUTH_URL: z.string().url("Better-Auth URL must be a valid URL"),

  // Google OAuth (optional — login Google disabled if missing)
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,

  // Cloudflare R2 (optional — memory upload uses local fallback if missing)
  CLOUDFLARE_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET_NAME: z.string().default("hidden-gift-memories"),
  R2_PUBLIC_URL: optionalUrl,

  // Trigger.dev (optional — scheduled jobs disabled if missing)
  TRIGGER_SECRET_KEY: optionalString,
  TRIGGER_PROJECT_ID: optionalString,

  // Resend (optional — emails logged to console if missing)
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: z.string().email().default("onboarding@resend.dev"),

  // Upstash Redis (optional — rate limit falls back to in-memory)
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalString,

  // Sentry (optional — errors logged to console only)
  SENTRY_DSN: optionalString,
  SENTRY_AUTH_TOKEN: optionalString,
  SENTRY_ORG: optionalString,
  SENTRY_PROJECT: z.string().default("hidden-gift"),

  // PayOS (Phase 3 only)
  PAYOS_CLIENT_ID: optionalString,
  PAYOS_API_KEY: optionalString,
  PAYOS_CHECKSUM_KEY: optionalString,
});

const clientSchema = z.object({
  // Supabase (REQUIRED — anon key safe in browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Supabase URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20, "Supabase anon key missing"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // PostHog (optional)
  NEXT_PUBLIC_POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://us.i.posthog.com"),

  // Plausible (optional)
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: optionalString,
});

// ─── Parse ─────────────────────────────────────────────────────────────────

function formatErrors(error: z.ZodError) {
  return error.errors.map((e) => `  - ${e.path.join(".")}: ${e.message}`).join("\n");
}

// Server schema only parses on server runtime; client bundle skips it because
// SUPABASE_SERVICE_ROLE_KEY and friends are server-only and would be `undefined`
// in the browser, breaking pages that import this module for NEXT_PUBLIC_* values.
const isServer = typeof window === "undefined";
let serverData: z.infer<typeof serverSchema>;
if (isServer) {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "\n❌ Invalid server environment variables:\n" +
        formatErrors(parsed.error) +
        "\n\nCheck .env.local against .env.example. See docs/API-KEYS-GUIDE.md.\n",
    );
    throw new Error("Missing required environment variables");
  }
  serverData = parsed.data;
} else {
  // Stub for client bundles. Files that import server-only fields are gated
  // by `import "server-only"` and never execute in this branch.
  serverData = {} as z.infer<typeof serverSchema>;
}

const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
});
if (!parsedClient.success) {
  console.error(
    "\n❌ Invalid public environment variables:\n" + formatErrors(parsedClient.error) + "\n",
  );
  throw new Error("Missing required NEXT_PUBLIC_* environment variables");
}

const serverEnv = serverData;
const clientEnv = parsedClient.data;

// ─── Feature flags (derived) ───────────────────────────────────────────────

export const features = {
  googleAuth: Boolean(serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET),
  r2: Boolean(
    serverEnv.CLOUDFLARE_ACCOUNT_ID &&
    serverEnv.R2_ACCESS_KEY_ID &&
    serverEnv.R2_SECRET_ACCESS_KEY &&
    serverEnv.R2_PUBLIC_URL,
  ),
  trigger: Boolean(serverEnv.TRIGGER_SECRET_KEY && serverEnv.TRIGGER_PROJECT_ID),
  resend: Boolean(serverEnv.RESEND_API_KEY),
  upstash: Boolean(serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN),
  posthog: Boolean(clientEnv.NEXT_PUBLIC_POSTHOG_KEY),
  sentry: Boolean(serverEnv.SENTRY_DSN),
  plausible: Boolean(clientEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
  payos: Boolean(
    serverEnv.PAYOS_CLIENT_ID && serverEnv.PAYOS_API_KEY && serverEnv.PAYOS_CHECKSUM_KEY,
  ),
} as const;

// ─── Warnings (dev only) ───────────────────────────────────────────────────

if (typeof window === "undefined" && serverEnv.NODE_ENV !== "production") {
  const disabled = Object.entries(features)
    .filter(([, enabled]) => !enabled)
    .map(([name]) => name);
  if (disabled.length > 0) {
    console.warn(
      `[env] Optional services disabled (missing keys): ${disabled.join(", ")}. ` +
        `See docs/API-KEYS-GUIDE.md to enable.`,
    );
  }
}

// ─── Exports ───────────────────────────────────────────────────────────────

export const env = {
  ...serverEnv,
  ...clientEnv,
} as const;

export type Env = typeof env;
