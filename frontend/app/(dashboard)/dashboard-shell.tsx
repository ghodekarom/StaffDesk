"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { visibleNavItems } from "@/lib/nav-config";
import { useTheme } from "@/lib/theme";
import { api } from "@/lib/api";
import { ToastProvider } from "@/components/ui/toast-notifications";
import { CommandPalette } from "@/components/ui/command-palette";
import { EmployeeDrawer, EmployeeDrawerData } from "@/components/ui/employee-drawer";
import { Employee } from "@/types/employee";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function LogoIcon({ className, idPrefix = "logo" }: { className?: string; idPrefix?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z" fill={`url(#${idPrefix}-grad-1)`}/>
      <path d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z" fill={`url(#${idPrefix}-grad-2)`}/>
      <defs>
        <linearGradient id={`${idPrefix}-grad-1`} x1="10" y1="4" x2="22" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-grad-2`} x1="10" y1="15" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const NAV_ICONS: Record<string, ReactNode> = {
  "/overview": (
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

interface LeaveRequestPage {
  totalElements: number;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, role, employeeId, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();

  const [cmdOpen, setCmdOpen] = useState(false);
  const [inspectData, setInspectData] = useState<EmployeeDrawerData | null>(null);
  const [liveTime, setLiveTime] = useState("");
  const [pendingLeaveCount, setPendingLeaveCount] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState("Loading...");

  useEffect(() => {
    if (employeeId) {
      api.get<Employee>(`/employees/${employeeId}`)
        .then(emp => setEmployeeName(`${emp.firstName} ${emp.lastName}`))
        .catch(() => setEmployeeName("User"));
    }
  }, [employeeId]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Fetch pending leave count dynamically — refresh whenever pathname changes
  // so approving/cancelling a request on the leave pages updates the badge
  const refreshLeaveCount = useCallback(async () => {
    try {
      const canReview = role === "ADMIN" || role === "HR" || role === "MANAGER";
      if (canReview) {
        // Managers see ALL pending requests from their team
        const data = await api.get<LeaveRequestPage>("/leave/requests/team", {
          status: "PENDING",
          size: 1,
        }, { fresh: true });
        setPendingLeaveCount(data?.totalElements ?? null);
      } else {
        // Employees see their own pending requests
        const data = await api.get<LeaveRequestPage>("/leave/requests/me", {
          status: "PENDING",
          size: 1,
        }, { fresh: true });
        setPendingLeaveCount(data?.totalElements ?? null);
      }
    } catch {
      setPendingLeaveCount(null);
    }
  }, [role]);

  useEffect(() => {
    if (isAuthenticated && role) {
      refreshLeaveCount();
    }
  }, [isAuthenticated, role, pathname, refreshLeaveCount]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isInitializing, isAuthenticated, pathname, router]);

  useEffect(() => {
    const updateTime = () => {
      setLiveTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      );
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
    if (path === "/overview") return "Overview Dashboard";
    if (path === "/employees") return "Employee Directory";
    if (path === "/departments") return "Department Hierarchy";
    if (path.startsWith("/attendance")) return "Attendance & Clock Log";
    if (path.startsWith("/leave")) return "Leave Requests & Approvals";
    return "StaffDesk";
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen">

        {/* ── Desktop Sidebar (hidden on mobile) ───────────────────────── */}
        <aside className="hidden md:flex sticky top-0 h-screen w-60 bg-sidebarBg text-white flex-col border-r border-white/10 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-white/10 font-display text-lg font-bold text-white tracking-tight">
            <LogoIcon className="w-7 h-7" idPrefix="desktop" />
            StaffDesk
          </div>

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">
              Navigation
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active =
                  item.href === "/overview"
                    ? pathname === "/overview"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-sky-500/20 text-sky-400 font-semibold"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {NAV_ICONS[item.href]}
                      <span>{item.label}</span>
                      {item.href === "/leave" && pendingLeaveCount !== null && pendingLeaveCount > 0 && (
                        <span className="ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                          {pendingLeaveCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* User section */}
          <div className="px-3 py-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-semibold text-xs flex items-center justify-center uppercase">
                  {employeeName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{employeeName}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{role ? role.toLowerCase() : "Loading..."}</div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-md border border-white/15 bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            >
              <LogoutIcon />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="h-14 px-4 sm:px-6 bg-surface flex items-center justify-between sticky top-0 z-30 gap-3">
            <div className="flex items-center gap-2">
              {/* Mobile: StaffDesk wordmark (no hamburger) */}
              <span className="md:hidden flex items-center gap-2 font-display text-base font-bold text-ink tracking-tight">
                <LogoIcon className="w-6 h-6" idPrefix="mobile" />
                StaffDesk
              </span>
              {/* Desktop: page title */}
              <h1 className="hidden md:block font-semibold text-sm text-ink">{getTitle(pathname)}</h1>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Search trigger */}
              <div
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-2 bg-input border border-line px-3 py-1.5 rounded-lg text-xs text-muted cursor-pointer hover:border-lineHover w-32 sm:w-52"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="truncate">Search...</span>
                <kbd className="hidden sm:inline bg-surface border border-line px-1 py-0.5 rounded text-[10px] font-semibold ml-auto">
                  Ctrl K
                </kbd>
              </div>

              {/* IST Clock — desktop only */}
              <div className="hidden sm:flex font-mono text-xs text-muted items-center gap-1.5 bg-canvas px-2.5 py-1.5 rounded-md border border-line whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{liveTime}</span>
              </div>

              {/* Mobile: theme & logout in topbar */}
              <div className="md:hidden flex items-center gap-1.5">
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-md border border-line bg-input text-ink flex items-center justify-center hover:bg-canvas transition-colors"
                  title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/20 transition-colors"
                  title="Sign Out"
                >
                  <LogoutIcon />
                </button>
              </div>
            </div>
          </header>

          {/* Page content — extra bottom padding on mobile for the tab bar */}
          <main className="flex-1 p-4 sm:p-6 pb-32 md:pb-6 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* ── Mobile Bottom Tab Bar (hidden on desktop) ─────────────────── */}
        <nav className="md:hidden fixed bottom-4 inset-x-4 z-50 bg-surface rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/5">
          <div className="flex items-stretch justify-around px-2 py-1">
            {items.map((item) => {
              const active =
                item.href === "/overview"
                  ? pathname === "/overview"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center gap-1 p-2 min-w-[3.5rem] rounded-xl transition-all ${
                    active ? "bg-accent/10 text-accent" : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  {/* Icon with badge for leave */}
                  <span className="relative">
                    {NAV_ICONS[item.href]}
                    {item.href === "/leave" && pendingLeaveCount !== null && pendingLeaveCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-white flex items-center justify-center leading-none shadow-sm">
                        {pendingLeaveCount > 9 ? "9+" : pendingLeaveCount}
                      </span>
                    )}
                  </span>
                  
                  {/* Active label only for a cleaner modern look, or keep all labels */}
                  <span className={`text-[9px] font-semibold tracking-wide ${active ? "opacity-100" : "opacity-70"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
        <EmployeeDrawer data={inspectData} onClose={() => setInspectData(null)} />
      </div>
    </ToastProvider>
  );
}
