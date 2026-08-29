"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` when the browser reports it has no network connectivity.
 * Subscribes to the `online` and `offline` window events so the value
 * updates reactively without polling.
 *
 * Safe to use in SSR — always returns `false` on the server (navigator is
 * unavailable), and syncs to the real value on the first client render.
 */
export function useOfflineStatus(): boolean {
  // Default to false (online) for SSR; correct immediately on client hydration
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    // Sync to the real browser state on mount
    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return isOffline;
}
