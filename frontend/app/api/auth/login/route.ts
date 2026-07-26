import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "@/lib/auth-cookies";
import type { ClientAuthResponse, ApiErrorBody } from "@/types/auth";

// Server-side only — never exposed to the browser. Points directly at the
// Spring Boot backend (e.g. http://localhost:8080/api/v1 in dev, your
// Render URL in prod). Distinct from NEXT_PUBLIC_API_BASE_URL, which the
// browser uses for authenticated data calls after login.
const BACKEND_BASE_URL = process.env.BACKEND_API_BASE_URL;

export async function POST(request: NextRequest) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json(
      { message: "BACKEND_API_BASE_URL is not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();

  const backendResponse = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!backendResponse.ok) {
    const errorBody: ApiErrorBody = await backendResponse.json().catch(() => ({
      timestamp: new Date().toISOString(),
      status: backendResponse.status,
      error: "Error",
      message: "Login failed",
      path: "/api/v1/auth/login",
    }));
    return NextResponse.json(errorBody, { status: backendResponse.status });
  }

  const data = await backendResponse.json();

  const clientResponse: ClientAuthResponse = {
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
    employeeId: data.employeeId,
    role: data.role,
  };

  const response = NextResponse.json(clientResponse);

  // Refresh token never reaches client JS — httpOnly cookie only.
  response.cookies.set(
    REFRESH_COOKIE_NAME,
    data.refreshToken,
    refreshCookieOptions()
  );

  return response;
}
