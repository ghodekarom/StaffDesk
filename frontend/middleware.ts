import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME } from "@/lib/auth-cookies";

// Cheap, edge-safe check: presence of the refresh cookie means "has a
// session worth trying to restore." It does NOT validate the token itself
// (that happens server-side in /api/auth/refresh) — this just keeps
// obviously-logged-out users from ever reaching dashboard pages.
export function middleware(request: NextRequest) {
  const hasRefreshCookie = request.cookies.has(REFRESH_COOKIE_NAME);

  if (!hasRefreshCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/employees/:path*", "/attendance/:path*", "/leave/:path*", "/departments/:path*"],
};
