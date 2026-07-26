"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import type { ClientAuthResponse, LoginPayload, Role } from "@/types/auth";
import { setAccessTokenGetter, setUnauthorizedHandler } from "@/lib/api";

interface AuthContextValue {
  accessToken: string | null;
  role: Role | null;
  employeeId: number | null;
  isInitializing: boolean; // true during the initial silent-refresh attempt
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  // Called by the api.ts fetch wrapper when a request gets a 401.
  // Returns the new access token, or null if the session couldn't be restored.
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const applySession = useCallback((data: ClientAuthResponse) => {
    setAccessToken(data.accessToken);
    setRole(data.role);
    setEmployeeId(data.employeeId);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setRole(null);
    setEmployeeId(null);
  }, []);

  // Multiple requests can 401 at roughly the same time (e.g. several
  // widgets fetching on page load with an expired token). Without dedup,
  // each one would call /api/auth/refresh independently; since refresh
  // tokens are rotated/single-use server-side, only the first would
  // succeed and the rest would fail. This ref makes every concurrent
  // caller share the same in-flight refresh instead of starting new ones.
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  const refreshAccessToken = useCallback((): Promise<string | null> => {
    if (refreshInFlight.current) {
      return refreshInFlight.current;
    }

    const promise = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (!res.ok) {
          clearSession();
          return null;
        }
        const data: ClientAuthResponse = await res.json();
        applySession(data);
        return data.accessToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = promise;
    return promise;
  }, [applySession, clearSession]);

  // Keep api.ts's module-level references in sync with current state,
  // so apiFetch() always has a fresh token and a working refresh callback
  // without needing to import React into that module.
  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
    setUnauthorizedHandler(refreshAccessToken);
  }, [accessToken, refreshAccessToken]);

  // On every full page load, the access token is gone (it only ever lived
  // in memory). Try to silently restore it using the httpOnly refresh
  // cookie, which the browser sends automatically.
  useEffect(() => {
    refreshAccessToken().finally(() => setIsInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message ?? "Login failed");
      }

      const data: ClientAuthResponse = await res.json();
      applySession(data);
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        role,
        employeeId,
        isInitializing,
        isAuthenticated: accessToken !== null,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}