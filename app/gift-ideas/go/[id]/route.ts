/**
 * @file app/gift-ideas/go/[id]/route.ts
 * @description Outbound affiliate redirect. Increments click counter on the
 *              gift_ideas row, appends UTM parameters, then 302 to partner URL.
 *              Fires server-side PostHog event for funnel analytics.
 */

import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { captureServerEvent } from "@/lib/analytics/server";
import { getCurrentUser } from "@/lib/auth/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // UUID-shape sanity check before hitting DB
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.redirect(new URL("/gift-ideas", request.url));
  }

  const admin = createAdminClient();
  const { data: idea } = await admin
    .from("gift_ideas")
    .select("id, title, affiliate_url, affiliate_partner")
    .eq("id", id)
    .maybeSingle();

  if (!idea?.affiliate_url) {
    return NextResponse.redirect(new URL("/gift-ideas", request.url));
  }

  // Increment click counter (best-effort, don't block redirect)
  void admin.rpc("increment_gift_idea_click", { p_id: id });

  // PostHog server event — fire-and-forget
  const user = await getCurrentUser();
  if (user) {
    void captureServerEvent({
      distinctId: user.id,
      event: "gift_idea_click",
      properties: {
        gift_idea_id: id,
        title: idea.title,
        partner: idea.affiliate_partner,
      },
    });
  }

  // Append UTM so partner can attribute traffic from us
  const target = new URL(idea.affiliate_url as string);
  target.searchParams.set("utm_source", "hidden-gift");
  target.searchParams.set("utm_medium", "gift-ideas");
  target.searchParams.set("utm_campaign", (idea.affiliate_partner as string) ?? "default");
  target.searchParams.set("utm_content", id);

  return NextResponse.redirect(target.toString(), 302);
}
