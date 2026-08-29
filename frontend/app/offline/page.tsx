"use client";

import { useEffect, useState } from "react";

const CACHED_PAGES = [
  { label: "Overview", href: "/overview", icon: "📊" },
  { label: "Attendance", href: "/attendance", icon: "🕐" },
  { label: "My Leave", href: "/leave", icon: "🏖️" },
  { label: "Messages", href: "/messages", icon: "💬" },
  { label: "Notifications", href: "/settings", icon: "🔔" },
];

export default function OfflinePage() {
  const [dots, setDots] = useState(".");

  // Animated "waiting for connection" dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Auto-reload when connectivity is restored
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%), #0f1117",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
        color: "#e2e8f0",
      }}
    >
      {/* Animated signal icon */}
      <div
        style={{
          position: "relative",
          width: 88,
          height: 88,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            animation: "sdRipple 2.4s ease-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.18)",
            border: "1px solid rgba(99,102,241,0.35)",
            animation: "sdRipple 2.4s ease-out 0.6s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 24,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a5b4fc"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 28, height: 28 }}
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill="#a5b4fc" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: "clamp(22px, 5vw, 28px)",
          fontWeight: 600,
          fontFamily: "var(--font-display, Space Grotesk, sans-serif)",
          margin: "0 0 10px",
          color: "#f1f5f9",
          textAlign: "center",
        }}
      >
        You&rsquo;re offline
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "#94a3b8",
          margin: "0 0 36px",
          textAlign: "center",
          maxWidth: 340,
          lineHeight: 1.6,
        }}
      >
        Waiting for a connection{dots} StaffDesk will reload automatically once
        you&rsquo;re back online.
      </p>

      {/* Cached pages grid */}
      <div style={{ width: "100%", maxWidth: 440, marginBottom: 36 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#64748b",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Available from cache
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 10,
          }}
        >
          {CACHED_PAGES.map((page) => (
            <a
              key={page.href}
              href={page.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none",
                color: "#cbd5e1",
                fontSize: 13,
                fontWeight: 500,
                transition: "background 0.18s, border-color 0.18s, transform 0.18s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(99,102,241,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(99,102,241,0.4)";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0)";
              }}
            >
              <span style={{ fontSize: 22 }}>{page.icon}</span>
              <span>{page.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Manual reload button */}
      <button
        onClick={() => window.location.reload()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 22px",
          borderRadius: 8,
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.35)",
          color: "#a5b4fc",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          transition: "background 0.18s, transform 0.18s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(99,102,241,0.25)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(99,102,241,0.15)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 15, height: 15 }}
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Try again
      </button>

      <style>{`
        @keyframes sdRipple {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.45); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
