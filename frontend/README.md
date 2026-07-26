# Frontend Auth Scaffold — Integration Guide

Implements the BFF pattern: the browser never sees the refresh token.
Access token lives in memory only (React state); refresh token lives in an
httpOnly cookie set by our own Next.js API routes.

## File map (drop into your existing Next.js project)

```
app/
├── api/auth/
│   ├── login/route.ts      (BFF: calls backend, sets httpOnly cookie)
│   ├── refresh/route.ts    (BFF: reads cookie, rotates it, returns new access token)
│   └── logout/route.ts     (BFF: clears the cookie)
├── (auth)/login/page.tsx   (login form)
├── (dashboard)/layout.tsx  (client-side guard + role-based nav)
└── layout.tsx              (mounts <AuthProvider> at the root)

lib/
├── auth-context.tsx        (React context: token, role, login/logout/refresh)
├── auth-cookies.ts         (shared cookie name/options for the 3 BFF routes)
├── api.ts                  (fetch wrapper: injects Bearer token, 401→refresh→retry-once)
└── nav-config.ts           (which nav items each role sees)

types/
└── auth.ts

middleware.ts                (redirects to /login if no refresh cookie present)
```

## 1. Environment variables

Two different base URLs — don't collapse them into one:

```
# .env.local

# Used SERVER-SIDE ONLY by the BFF routes (login/refresh). Never sent to the browser.
BACKEND_API_BASE_URL=http://localhost:8080/api/v1

# Used CLIENT-SIDE by lib/api.ts for authenticated data calls directly to
# the backend (your CORS is already wired for this per the status report).
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

In production these will likely point to the same Render URL, but keep them
as separate env vars — it's what stops the refresh token from ever being
fetchable client-side by accident.

## 2. How the pieces fit together

1. User submits the login form → `AuthProvider.login()` → `POST /api/auth/login` (our own route, not the backend directly).
2. That route calls the Spring Boot backend server-side, gets back `{accessToken, refreshToken, ...}`, sets `refreshToken` as an httpOnly cookie, and returns everything **except** the refresh token to the browser.
3. `AuthProvider` holds `accessToken` in React state (memory only — gone on full page reload, by design).
4. Any authenticated data call goes through `apiFetch()` in `lib/api.ts`, which calls the **backend directly** (not through our BFF) with `Authorization: Bearer <accessToken>`.
5. On page reload, `AuthProvider`'s `useEffect` fires `POST /api/auth/refresh` immediately. The browser automatically attaches the httpOnly cookie. If valid, a new access token comes back and the session is silently restored — the user never sees a login flash.
6. If any backend call returns 401 mid-session (token expired), `apiFetch` calls the same refresh flow once and retries the original request. If refresh also fails, the user is bounced to `/login`.
7. `middleware.ts` does a cheap server-side check (cookie present or not) before dashboard routes even render, so logged-out users don't get a flash of protected UI.

## 3. Wiring existing pages into this

Replace whatever this used before with `apiFetch` / `apiJson` from `lib/api.ts`, e.g.:

```ts
import { apiJson } from "@/lib/api";

const employees = await apiJson<Employee[]>("/employees?page=0&size=20");
```

No manual header-setting needed — `apiFetch` injects the token and handles refresh transparently.

## 4. Things to double check against your actual backend responses

- The backend's `AuthResponse` currently returns `role` as a plain string (e.g. `"ADMIN"`). This scaffold assumes that shape — confirm the JSON key names match (`accessToken`, `refreshToken`, `expiresIn`, `employeeId`, `role`).
- CORS: your backend must allow credentials-less requests here fine (Bearer token, no cookies sent to the backend itself) — no `credentials: "include"` needed on `apiFetch`'s calls to the backend. Cookies only matter for calls to your **own** `/api/auth/*` routes, which are same-origin by definition.

## 5. Not built yet (flag if you want these next)

- "Remember me" / persistent sessions beyond the 7-day refresh window
- Multi-tab session sync (logging out in one tab doesn't yet notify other open tabs)
- Loading/error states wired into the actual Employees/Departments/Attendance/Leave pages — this scaffold only covers the auth shell around them
