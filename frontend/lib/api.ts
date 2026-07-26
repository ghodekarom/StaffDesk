// Calls the Spring Boot backend directly from the browser (CORS is already
// wired per the backend's Phase 1 setup). Only token issuance/refresh goes
// through our own /api/auth/* BFF routes — everything else hits the
// backend straight, exactly as the architecture doc specifies:
// "Frontend never talks to the DB directly — everything goes through the
// Spring Boot REST API."

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiFetchOptions extends RequestInit {
  skipAuthRetry?: boolean; // internal flag to prevent infinite retry loops
}

// Thrown by apiJson() on any non-2xx response. Carries the HTTP status and
// the backend's structured error body (timestamp/status/error/message/path)
// so callers can do `err instanceof ApiError` and read `err.status` / `err.body`.
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// Injected by AuthProvider so this module doesn't need to import React.
// Call setAccessTokenGetter(() => accessToken) once from AuthProvider,
// and setUnauthorizedHandler(refreshAccessToken) similarly.
let getAccessToken: () => string | null = () => null;
let onUnauthorized: () => Promise<string | null> = async () => null;

export function setAccessTokenGetter(fn: () => string | null) {
  getAccessToken = fn;
}

export function setUnauthorizedHandler(fn: () => Promise<string | null>) {
  onUnauthorized = fn;
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { skipAuthRetry, ...init } = options;

  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401 && !skipAuthRetry) {
    const newToken = await onUnauthorized();
    if (newToken) {
      // Retry exactly once with the freshly refreshed token, passed
      // explicitly. We can't rely on getAccessToken() here — it's a
      // module-level closure that only gets updated once AuthProvider's
      // effect re-runs after the accessToken state update commits, which
      // hasn't necessarily happened yet at this point in the microtask
      // queue. Passing newToken directly avoids that race.
      return apiFetch(path, {
        ...options,
        skipAuthRetry: true,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
    // Refresh failed — bubble the 401 up so the caller can redirect to login.
  }

  return response;
}

export async function apiJson<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(
      errorBody?.message ?? `Request failed: ${response.status}`,
      response.status,
      errorBody
    );
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Lightweight GET cache + in-flight dedup.
//
// Every module switch (Employees -> Attendance -> Departments -> back to
// Employees) was re-issuing a fresh network request even for data fetched
// seconds ago, and because this app calls the backend directly with an
// Authorization header, each of those requests pays a CORS preflight round
// trip on top of the real one. This cache makes revisits within TTL_MS
// resolve instantly from memory instead of hitting the network again, and
// dedupes concurrent identical requests (e.g. effects firing twice in dev,
// or two widgets requesting the same page at once).
//
// Any write (POST/PUT/PATCH/DELETE) clears the whole cache — simple and
// safe for this app's size, avoids ever serving stale data after a mutation.
// ---------------------------------------------------------------------------

const TTL_MS = 15_000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const getCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

function invalidateGetCache() {
  getCache.clear();
  inFlight.clear();
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}

// Compatibility wrapper for code written against a REST-client-style `api`
// object (api.get/post/put/patch/delete).
export const api = {
  // Second argument is a query-params object, e.g.
  // api.get<Page<Employee>>("/employees", { page: 0, size: 20, sort: "lastName,asc" })
  //
  // Pass { fresh: true } to bypass the cache and force a network hit (e.g.
  // after an action you know changed server state elsewhere).
  get: <T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    opts?: { fresh?: boolean }
  ): Promise<T> => {
    const key = `${path}${buildQuery(params)}`;

    if (!opts?.fresh) {
      const cached = getCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return Promise.resolve(cached.data as T);
      }
      const pending = inFlight.get(key);
      if (pending) {
        return pending as Promise<T>;
      }
    }

    const promise = apiJson<T>(key, { method: "GET" })
      .then((data) => {
        getCache.set(key, { data, expiresAt: Date.now() + TTL_MS });
        inFlight.delete(key);
        return data;
      })
      .catch((err) => {
        inFlight.delete(key);
        throw err;
      });

    inFlight.set(key, promise);
    return promise;
  },

  post: <T = unknown>(path: string, body?: unknown) =>
    apiJson<T>(path, { method: "POST", body: JSON.stringify(body) }).then((res) => {
      invalidateGetCache();
      return res;
    }),

  put: <T = unknown>(path: string, body?: unknown) =>
    apiJson<T>(path, { method: "PUT", body: JSON.stringify(body) }).then((res) => {
      invalidateGetCache();
      return res;
    }),

  patch: <T = unknown>(path: string, body?: unknown) =>
    apiJson<T>(path, { method: "PATCH", body: JSON.stringify(body) }).then((res) => {
      invalidateGetCache();
      return res;
    }),

  delete: <T = unknown>(path: string) =>
    apiJson<T>(path, { method: "DELETE" }).then((res) => {
      invalidateGetCache();
      return res;
    }),
};