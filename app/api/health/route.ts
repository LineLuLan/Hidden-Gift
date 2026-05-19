/**
 * @file app/api/health/route.ts
 * @description Liveness + readiness probe. Verifies the server can reach Supabase.
 *              Returns 200 with payload when healthy, 503 when not.
 */

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

interface HealthPayload {
  status: "ok" | "degraded";
  uptime_seconds: number;
  checks: {
    db: { ok: boolean; latency_ms: number | null; error?: string };
  };
  build: { commit: string | null; node_env: string };
}

const startedAt = Date.now();

export async function GET() {
  const dbStart = Date.now();
  let dbOk = false;
  let dbError: string | undefined;
  let dbLatency: number | null = null;

  try {
    const admin = createAdminClient();
    // Cheap query — count of a tiny table
    const { error } = await admin
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .limit(1);
    if (error) {
      dbError = error.message;
    } else {
      dbOk = true;
    }
    dbLatency = Date.now() - dbStart;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "unknown";
  }

  const payload: HealthPayload = {
    status: dbOk ? "ok" : "degraded",
    uptime_seconds: Math.floor((Date.now() - startedAt) / 1000),
    checks: {
      db: { ok: dbOk, latency_ms: dbLatency, error: dbError },
    },
    build: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      node_env: process.env.NODE_ENV ?? "development",
    },
  };

  return NextResponse.json(payload, {
    status: dbOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
