import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Marketing routes anyone (auth or not) can visit.
const MARKETING_PATHS = new Set(["/welcome", "/about"]);

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Unauthenticated visitors hitting `/` get the marketing landing, not /login.
  if (!user && pathname === "/") {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  // Authenticated users on marketing landing → home dashboard.
  if (user && MARKETING_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public files with extension
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)",
  ],
};
