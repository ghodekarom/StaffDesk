"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { visibleNavItems } from "@/lib/nav-config";
import { useTheme } from "@/lib/theme";
import { ToastProvider } from "@/components/ui/toast-notifications";
import { CommandPalette } from "@/components/ui/command-palette";
import { EmployeeDrawer, EmployeeDrawerData } from "@/components/ui/employee-drawer";

const NAV_ICONS: Record<string, ReactNode> = {
  "/": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  "/employees": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  ),
  "/departments": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21V9l9-6 9 6v12" />
      <path d="M9 21v-6h6v6" />
    </svg>
  ),
  "/attendance": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  "/leave": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [inspectData, setInspectData] = useState<EmployeeDrawerData | null>(null);
  const [liveTime, setLiveTime] = useState("09:41:02");

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isInitializing, isAuthenticated, pathname, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateTime = () => {
      setLiveTime(new Date().toLocaleTimeString("en-GB"));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    const handleInspect = (e: Event) => {
      const customEvent = e as CustomEvent<EmployeeDrawerData>;
      if (customEvent.detail) {
        setInspectData(customEvent.detail);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("inspect-employee", handleInspect);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("inspect-employee", handleInspect);
    };
  }, []);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading StaffDesk Workspace…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const items = visibleNavItems(role);

  const getTitle = (path: string) => {
    if (path === "/employees") return "Employee Directory";
    if (path === "/departments") return "Department Hierarchy";
    if (path === "/attendance") return "Attendance & Clock Log";
    if (path === "/leave") return "Leave Requests & Approvals";
    return "Overview Dashboard";
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        {/* Mobile Backdrop */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Sidebar Nav */}
        <aside
          className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-60 bg-sidebarBg text-white p-5 flex flex-col border-r border-white/10 transition-transform duration-200 ease-in-out md:translate-x-0 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between font-display text-lg font-bold text-white mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-ring"></span>
              StaffDesk
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden text-white/70 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
            Operations
          </div>

          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors relative ${
                      active
                        ? "bg-sky-500/20 text-sky-400 font-semibold"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {NAV_ICONS[item.href] || NAV_ICONS["/"]}
                    <span>{item.label}</span>
                    {item.href === "/leave" && (
                      <span className="ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                        2
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-semibold text-xs flex items-center justify-center">
                {role?.[0] ?? "A"}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Aisha Rahman</div>
                <div className="text-[11px] text-slate-400">{role || "Admin"}</div>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-md border border-white/15 bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Toggle Dark / Light Theme"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" />
              </svg>
            </button>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="h-15 px-4 sm:px-7 bg-surface border-b border-line flex items-center justify-between sticky top-0 z-30 gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-1.5 text-ink hover:bg-canvas rounded-md"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <h1 className="font-semibold text-sm sm:text-base text-ink">
                {getTitle(pathname)}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Command Trigger */}
              <div
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-2 bg-input border border-line px-3 py-1.5 rounded-lg text-xs text-muted cursor-pointer hover:border-lineHover w-36 sm:w-56"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="truncate">Search...</span>
                <kbd className="hidden sm:inline bg-surface border border-line px-1 py-0.5 rounded text-[10px] font-semibold ml-auto">
                  Ctrl K
                </kbd>
              </div>

              {/* Ticker Clock */}
              <div className="hidden sm:flex font-mono text-xs text-muted items-center gap-1.5 bg-canvas px-2.5 py-1.5 rounded-md border border-line">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{liveTime}</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-7 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Global Command Palette */}
        <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

        {/* Global Employee Drawer */}
        <EmployeeDrawer data={inspectData} onClose={() => setInspectData(null)} />
      </div>
    </ToastProvider>
  );
}