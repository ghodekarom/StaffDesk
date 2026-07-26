// Stub until the backend `auth` module (JWT login) exists.
// Per the docs: access token lives in memory on the client, refresh token
// in an httpOnly cookie set by the server. For now there's no login flow,
// so this always returns null and /api/v1/employees/** stays reachable
// unauthenticated (matches the backend's current temporary TODO).

let accessToken: string | null = null;

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string | null): void {
  accessToken = token;
}
