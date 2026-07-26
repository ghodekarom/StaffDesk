"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { visibleNavItems } from "@/lib/nav-config";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ICONS: Record<string, ReactNode> = {
  "/employees": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "/departments": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  "/attendance": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  "/leave": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  ),
};

function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
          <path d="M6 12h12M9 6h.01M9 9h.01M15 6h.01M15 9h.01M9 16h.01M15 16h.01" />
        </svg>
      </div>
      <span className="font-display text-[15px] font-semibold text-ink">StaffDesk</span>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Middleware already redirects on the server for a cold request, but this
  // covers the client-side-navigation case (e.g. refresh silently failed
  // after the token expired mid-session).
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isInitializing, isAuthenticated, pathname, router]);

  // Close the mobile drawer whenever the route actually changes, so tapping
  // a nav link doesn't leave the overlay open behind the new page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (isInitializing) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect effect above will kick in
  }

  const items = visibleNavItems(role);

  const navLinks = (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors " +
                (active
                  ? "bg-accent font-medium text-white"
                  : "text-muted hover:bg-canvas hover:text-ink")
              }
            >
              {NAV_ICONS[item.href] ?? null}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const accountFooter = (
    <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accentTint text-[11px] font-semibold text-accentInk">
            {role?.[0] ?? "?"}
          </div>
          <span className="text-xs text-muted">{role ?? "—"}</span>
        </div>
        <ThemeToggle />
      </div>
      <button
        onClick={() => logout().then(() => router.push("/login"))}
        className="w-full rounded-md px-2.5 py-2 text-left text-sm text-muted transition-colors hover:bg-canvas hover:text-ink"
      >
        Log out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col md:flex-row">
      {/* Mobile top bar — hidden on md+ where the persistent sidebar takes over */}
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <BrandMark />
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-ink hover:bg-canvas"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileNavOpen(false)} />
          <nav className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto bg-surface p-3 shadow-xl">
            <div className="flex items-center justify-between pb-5 pt-1">
              <BrandMark />
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1 text-muted hover:bg-canvas"
              >
                ✕
              </button>
            </div>
            {navLinks}
            {accountFooter}
          </nav>
        </div>
      )}

      {/* Desktop sidebar — persistent, hidden below md */}
      <nav className="hidden w-56 flex-shrink-0 flex-col border-r border-line bg-surface p-3 md:flex">
        <div className="px-2 pb-5 pt-1">
          <BrandMark />
        </div>
        {navLinks}
        {accountFooter}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}