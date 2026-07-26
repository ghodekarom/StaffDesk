import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "@/lib/auth-cookies";
import type { ClientAuthResponse } from "@/types/auth";

const BACKEND_BASE_URL = process.env.BACKEND_API_BASE_URL;

export async function POST(request: NextRequest) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json(
      { message: "BACKEND_API_BASE_URL is not configured" },
      { status: 500 }
    );
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  const backendResponse = await fetch(`${BACKEND_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!backendResponse.ok) {
    // Refresh token expired/invalid — clear the cookie so the client
    // stops retrying and redirects to login instead.
    const response = NextResponse.json(
      { message: "Session expired" },
      { status: 401 }
    );
    response.cookies.delete(REFRESH_COOKIE_NAME);
    return response;
  }

  const data = await backendResponse.json();

  const clientResponse: ClientAuthResponse = {
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
    employeeId: data.employeeId,
    role: data.role,
  };

  const response = NextResponse.json(clientResponse);

  // Backend rotates the refresh token on every use — store the new one.
  response.cookies.set(
    REFRESH_COOKIE_NAME,
    data.refreshToken,
    refreshCookieOptions()
  );

  return response;
}
