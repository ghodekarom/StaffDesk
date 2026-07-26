import { NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME, clearedRefreshCookieOptions } from "@/lib/auth-cookies";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(REFRESH_COOKIE_NAME, "", clearedRefreshCookieOptions());
  return response;
}
