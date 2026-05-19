/**
 * @file lib/email/send.ts
 * @description Resend wrapper. Real send when RESEND_API_KEY present, otherwise
 *              logs to console so dev flows still observe payloads.
 */

import "server-only";

import { env, features } from "@/lib/env";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  /** Reply-to override (defaults to RESEND_FROM_EMAIL). */
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; error?: string }> {
  if (!features.resend) {
    console.log("[email:no-op]", {
      from: env.RESEND_FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      preview: params.html.replace(/<[^>]+>/g, "").slice(0, 120),
    });
    return { ok: true };
  }

  try {
    const { Resend } = await import("resend");
    const client = new Resend(env.RESEND_API_KEY!);
    const result = await client.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });
    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[email] send failed:", err);
    return { ok: false, error: message };
  }
}
