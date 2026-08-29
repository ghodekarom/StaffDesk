"use client";

import { useEffect, useState } from "react";
import { useOfflineStatus } from "@/lib/use-offline-status";

/**
 * Animated sticky banner that slides in from the top when the user loses
 * network connectivity, and slides back out when connectivity is restored.
 *
 * Integrated into the dashboard shell so it appears across all protected pages.
 */
export function OfflineBanner() {
  const isOffline = useOfflineStatus();
  // Controls the enter/exit CSS transition — we keep the banner in the DOM
  // for one extra render after going back online so the slide-out animation
  // can complete before unmounting.
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setMounted(true);
      // Small delay to let the element mount before triggering the transition
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      // Wait for the CSS transition to finish before unmounting
      const timer = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isOffline ? "You are offline" : "You are back online"}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: visible ? "translateY(0)" : "translateY(-110%)",
        transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "10px 20px",
        background: isOffline
          ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
          : "linear-gradient(135deg, #14532d 0%, #166534 100%)",
        borderBottom: isOffline
          ? "1px solid rgba(99,102,241,0.4)"
          : "1px solid rgba(34,197,94,0.4)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        color: "#fff",
        fontSize: "13px",
        fontWeight: 500,
        fontFamily: "var(--font-body, Inter, sans-serif)",
        letterSpacing: "0.01em",
      }}
    >
      {/* Animated connectivity icon */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: isOffline
            ? "rgba(99,102,241,0.25)"
            : "rgba(34,197,94,0.25)",
          flexShrink: 0,
        }}
      >
        {isOffline ? (
          /* Wi-Fi off icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 13, height: 13, color: "#a5b4fc" }}
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill="currentColor" />
          </svg>
        ) : (
          /* Check icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 13, height: 13, color: "#86efac" }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>

      <span>
        {isOffline ? (
          <>
            <strong style={{ fontWeight: 600 }}>You&rsquo;re offline.</strong>{" "}
            Showing cached data — some features may be unavailable.
          </>
        ) : (
          <>
            <strong style={{ fontWeight: 600 }}>Back online.</strong>{" "}
            Refreshing data&hellip;
          </>
        )}
      </span>

      {/* Pulsing dot indicator */}
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: isOffline ? "#818cf8" : "#4ade80",
          flexShrink: 0,
          animation: isOffline ? "sdPulse 2s ease-in-out infinite" : "none",
        }}
      />

      <style>{`
        @keyframes sdPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
