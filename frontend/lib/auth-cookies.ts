export const REFRESH_COOKIE_NAME = "ems_refresh_token";

// 7 days, matching the backend's jwt.refresh-expiration (604800000 ms).
// Keep these two in sync if you change one.
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // "/" so middleware (which runs on dashboard routes) can read it too.
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  };
}

export function clearedRefreshCookieOptions() {
  return {
    ...refreshCookieOptions(),
    maxAge: 0,
  };
}
