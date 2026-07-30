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
import { motion, AnimatePresence } from "framer-motion";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="flex min-h-screen bg-[#070A11] text-slate-300">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex sticky top-0 h-screen w-60 bg-[#0E1322] text-white flex-col border-r border-white/5 shrink-0 z-50 p-4 justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-2 pt-2 pb-5 font-display text-lg font-bold text-white tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#38BDF8] via-[#818CF8] to-[#C084FC] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <div className="w-full h-full bg-[#0E1322] rounded-[10px] flex items-center justify-center">
                  <LogoIcon className="w-4 h-4" idPrefix="desktop" />
                </div>
              </div>
              StaffDesk
            </div>

            {/* Nav links */}
            <div className="px-1 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-2">
                Navigation
              </p>
              <ul className="space-y-1.5">
                {items.map((item) => {
                  const active =
                    item.href === "/overview"
                      ? pathname === "/overview"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? "bg-[#1E2738] text-white border border-white/10 shadow-sm"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className={active ? "text-cyan-400" : "text-slate-400"}>
                          {NAV_ICONS[item.href]}
                        </span>
                        <span>{item.label}</span>
                        {item.href === "/leave" && pendingLeaveCount !== null && pendingLeaveCount > 0 && (
                          <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                            {pendingLeaveCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* User section */}
          <div className="px-2 py-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {employeeName.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white truncate max-w-[90px]">{employeeName}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{role ? role.toLowerCase() : "Loading..."}</div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors mt-2"
            >
              <LogoutIcon />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070A11]">
          {/* Desktop Topbar */}
          <header className="hidden md:flex items-center justify-between px-8 h-16 bg-[#0E1322]/80 backdrop-blur-md border-b border-white/5 shrink-0 sticky top-0 z-[40]">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white tracking-tight">{getTitle(pathname)}</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Search trigger */}
              <div
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-2 bg-[#151C2C] border border-white/10 px-3.5 py-1.5 rounded-xl text-xs text-slate-400 cursor-pointer hover:border-white/20 w-48 lg:w-64"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="truncate">Search employees, departments...</span>
                <kbd className="hidden sm:inline bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 ml-auto">
                  Ctrl K
                </kbd>
              </div>

              {/* Bookmark Icon */}
              <button className="w-8 h-8 rounded-full bg-[#151C2C] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="Quick Actions">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>

              {/* Notification Bell with red dot */}
              <button className="w-8 h-8 rounded-full bg-[#151C2C] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative" title="Notifications">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0E1322]" />
              </button>

              {/* IST Clock */}
              <div className="flex font-mono text-xs text-slate-300 items-center gap-1.5 bg-[#151C2C] px-3 py-1.5 rounded-xl border border-white/10 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{liveTime}</span>
              </div>
            </div>
          </header>

          {/* Mobile Topbar */}
          <header className="md:hidden flex items-center justify-between px-5 h-16 bg-[#0E1322]/90 backdrop-blur-md border-b border-white/10 shrink-0 sticky top-0 z-[40]">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 font-display text-base font-bold text-white tracking-tight">
                <LogoIcon className="w-6 h-6" idPrefix="mobile" />
                StaffDesk
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-2 bg-[#151C2C] border border-white/10 px-3 py-1.5 rounded-lg text-xs text-slate-400 cursor-pointer hover:border-white/20 w-32 sm:w-52"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="truncate">Search...</span>
              </div>

              <div className="flex items-center gap-1.5 relative">
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-md border border-white/10 bg-[#151C2C] text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                  title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>

                <button
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className="w-8 h-8 rounded-md border border-white/10 bg-[#151C2C] text-white flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Open navigation menu"
                >
                  {mobileMenuOpen ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>

                <AnimatePresence>
                  {mobileMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[45]"
                        onClick={() => setMobileMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-10 right-0 z-[46] w-52 bg-[#0E1322]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-semibold text-xs flex items-center justify-center uppercase shrink-0">
                            {employeeName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{employeeName}</div>
                            <div className="text-[11px] text-slate-400 capitalize">{role ? role.toLowerCase() : ""}</div>
                          </div>
                        </div>

                        <div className="py-1.5">
                          {items.map((item) => {
                            const active = item.href === "/overview"
                              ? pathname === "/overview"
                              : pathname.startsWith(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                                  active
                                    ? "text-cyan-400 bg-white/5"
                                    : "text-slate-300 hover:bg-white/5"
                                }`}
                              >
                                <span className="text-slate-400">{NAV_ICONS[item.href as keyof typeof NAV_ICONS]}</span>
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>

                        <div className="border-t border-white/10 py-1.5">
                          <button
                            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <LogoutIcon />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-x-clip">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>


        <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
        <EmployeeDrawer data={inspectData} onClose={() => setInspectData(null)} />
      </div>
    </ToastProvider>
  );
}
