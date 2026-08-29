"use client";

import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { visibleNavItems } from "@/lib/nav-config";
import { api } from "@/lib/api";
import { ToastProvider } from "@/components/ui/toast-notifications";
import { CommandPalette } from "@/components/ui/command-palette";
import { EmployeeDrawer, EmployeeDrawerData } from "@/components/ui/employee-drawer";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { StaffDeskLogo } from "@/components/ui/logo-mark";
import { Employee } from "@/types/employee";
import { UnreadCountResponse } from "@/types/notification";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarOff,
  MessageSquare,
  Wallet,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";

const NAV_ICONS: Record<string, ReactNode> = {
  "/overview": <LayoutDashboard size={16} />,
  "/employees": <Users size={16} />,
  "/departments": <Building2 size={16} />,
  "/attendance": <Clock size={16} />,
  "/leave": <CalendarOff size={16} />,
  "/messages": <MessageSquare size={16} />,
  "/payroll": <Wallet size={16} />,
  "/payroll/payslips": <Wallet size={16} />,
  "/settings": <Settings size={16} />,
};
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// Shakes the bell whenever `count` increases (new notification arrived)
// rather than on every render — e.g. going from 2 to 0 (marked as read)
// stays still.
function NotificationBell({ count, size }: { count: number | null; size: number }) {
  const prevCount = useRef<number | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (count !== null && prevCount.current !== null && count > prevCount.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <motion.span
      className="relative inline-flex"
      animate={shake ? { rotate: [0, -14, 12, -8, 4, 0] } : { rotate: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Bell size={size} />
      {count !== null && count > 0 && (
        <span
          className={`absolute rounded-full bg-[#e24b4a] font-medium text-white flex items-center justify-center ${
            size >= 17
              ? "-top-1.5 -right-1.5 min-w-[15px] h-[15px] px-[3px] text-[10px]"
              : "-top-1 -right-1 min-w-[14px] h-[14px] px-[3px] text-[9px]"
          }`}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </motion.span>
  );
}

interface LeaveRequestPage {
  totalElements: number;
}
interface UnreadMessageCountResponse {
  count: number;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, role, employeeId, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [cmdOpen, setCmdOpen] = useState(false);
  const [inspectData, setInspectData] = useState<EmployeeDrawerData | null>(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState("Loading...");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number | null>(null);

  useEffect(() => {
    if (employeeId) {
      api.get<Employee>(`/employees/${employeeId}`)
        .then((emp) => setEmployeeName(`${emp.firstName} ${emp.lastName}`))
        .catch(() => setEmployeeName("User"));
    }
  }, [employeeId]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const refreshLeaveCount = useCallback(async () => {
    try {
      const canReview = role === "ADMIN" || role === "HR" || role === "MANAGER";
      if (canReview) {
        const data = await api.get<LeaveRequestPage>("/leave/requests/team", {
          status: "PENDING",
          size: 1,
        }, { fresh: true });
        setPendingLeaveCount(data?.totalElements ?? null);
      } else {
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

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await api.get<UnreadCountResponse>("/notifications/unread-count", undefined, {
        fresh: true,
      });
      setUnreadCount(data?.count ?? null);
    } catch {
      setUnreadCount(null);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshUnreadCount();
    // Notifications can arrive from other users' actions (e.g. someone
    // submits a leave request), not just from this user's own navigation,
    // so poll rather than only refreshing on pathname change.
    const interval = setInterval(refreshUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadCount]);

  const refreshUnreadMessageCount = useCallback(async () => {
    try {
      const data = await api.get<UnreadMessageCountResponse>("/messages/unread-count", undefined, {
        fresh: true,
      });
      setUnreadMessageCount(data?.count ?? null);
    } catch {
      setUnreadMessageCount(null);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshUnreadMessageCount();
    // Same rationale as notifications: another employee sending a DM isn't
    // triggered by this user's own navigation, so this needs its own poll
    // rather than only refreshing when the route changes. The sidebar badge
    // is the one place this count is visible outside the /messages page
    // itself (which polls its own list independently, faster, while open).
    const interval = setInterval(refreshUnreadMessageCount, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadMessageCount]);

  useEffect(() => {
    // Reading a thread marks it read server-side immediately, but the
    // 60s poll above wouldn't reflect that promptly — refreshing on every
    // route change means leaving /messages/[id] clears the badge right away.
    if (isAuthenticated) refreshUnreadMessageCount();
  }, [isAuthenticated, pathname, refreshUnreadMessageCount]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isInitializing, isAuthenticated, pathname, router]);

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
      <div className="flex min-h-screen items-center justify-center text-sm text-[#9d9cae] bg-[#12121c]">
        Loading StaffDesk…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const items = visibleNavItems(role);
  const roleLabel = role ? role.charAt(0) + role.slice(1).toLowerCase() : "";

  // `layoutId` scoped per nav instance (desktop vs. mobile drawer) — both can
  // exist in the DOM at once (one hidden via CSS breakpoint, the other via
  // conditional render), so sharing one id across both would fight itself.
  const navLink = (item: (typeof items)[0], onClick?: () => void, layoutGroup: string = "desktop") => {
    const active =
      item.href === "/overview"
        ? pathname === "/overview"
        : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
          active ? "text-[#c9c2ff]" : "text-[#9d9cae] hover:text-[#e6e6ef] hover:bg-white/[0.04]"
        }`}
      >
        {active && (
          <motion.div
            layoutId={`nav-active-pill-${layoutGroup}`}
            className="absolute inset-0 rounded-lg bg-[rgba(139,127,251,0.16)]"
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2.5">
          {NAV_ICONS[item.href]}
          <span>{item.label}</span>
        </span>
        {item.href === "/leave" && pendingLeaveCount !== null && pendingLeaveCount > 0 && (
          <span className="relative z-10 ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-[rgba(237,161,0,0.15)] text-[#f7c98f]">
            {pendingLeaveCount}
          </span>
        )}
        {item.href === "/messages" && unreadMessageCount !== null && unreadMessageCount > 0 && (
          <span className="relative z-10 ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-[rgba(139,127,251,0.16)] text-[#c9c2ff]">
            {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <ToastProvider>
      <OfflineBanner />
      <div className="flex min-h-screen bg-[#12121c] text-[#e6e6ef]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex sticky top-0 h-screen w-[168px] flex-col shrink-0 z-50 p-4 justify-between">
          <div>
            <div className="flex items-center gap-2 px-0 pt-1.5 pb-5">
              <StaffDeskLogo size={26} idPrefix="logo-shell-sidebar" />
              <span className="text-[15px] font-medium">StaffDesk</span>
            </div>
            <nav className="flex flex-col gap-0.5">
              {items.map((item) => navLink(item, undefined, "desktop"))}
            </nav>
          </div>

          <div className="border-t border-[#26263a] pt-3">
            <div className="flex items-center gap-2 px-2.5 pb-2.5">
              <div className="w-[26px] h-[26px] rounded-full bg-[#8b7ffb] flex items-center justify-center text-[11px] font-medium text-[#0d0d16]">
                {initials(employeeName)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{employeeName}</div>
                <div className="text-[11px] text-[#9d9cae]">{roleLabel}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#f0a3a3] hover:bg-[rgba(226,75,74,0.1)] transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Topbar */}
          <header className="hidden md:flex items-center justify-end px-6 h-14 shrink-0">
            <div className="flex items-center gap-3 text-[#9d9cae]">
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative hover:text-[#e6e6ef] transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <NotificationBell count={unreadCount} size={17} />
                </button>
                <NotificationPanel
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  onCountChanged={refreshUnreadCount}
                />
              </div>
              <div className="w-[26px] h-[26px] rounded-full bg-[#8b7ffb] flex items-center justify-center text-[11px] font-medium text-[#0d0d16]">
                {initials(employeeName)}
              </div>
            </div>
          </header>

          {/* Mobile Topbar */}
          <header className="md:hidden flex items-center justify-between px-5 h-14 border-b border-[#26263a] shrink-0 sticky top-0 z-40 bg-[#12121c]">
            <div className="flex items-center gap-2">
              <StaffDeskLogo size={26} idPrefix="logo-shell-mobile" />
              <span className="text-[15px] font-medium">StaffDesk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setNotifOpen((o) => !o);
                  }}
                  className="relative w-8 h-8 rounded-lg border border-[#26263a] flex items-center justify-center text-[#9d9cae] hover:text-[#e6e6ef] transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <NotificationBell count={unreadCount} size={15} />
                </button>
                <NotificationPanel
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  onCountChanged={refreshUnreadCount}
                />
              </div>
              <button
                onClick={() => {
                  setNotifOpen(false);
                  setMobileMenuOpen((o) => !o);
                }}
                className="w-8 h-8 rounded-lg border border-[#26263a] flex items-center justify-center"
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
                      transition={{ duration: 0.15 }}
                      className="absolute top-12 right-4 z-[46] w-52 bg-[#1b1b29] border border-[#26263a] rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-[#26263a] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#8b7ffb] text-[#0d0d16] font-medium text-xs flex items-center justify-center">
                          {initials(employeeName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{employeeName}</div>
                          <div className="text-[11px] text-[#9d9cae]">{roleLabel}</div>
                        </div>
                      </div>
                      <div className="py-1.5 px-1.5 flex flex-col gap-0.5">
                        {items.map((item) => navLink(item, () => setMobileMenuOpen(false), "mobile"))}
                      </div>
                      <div className="border-t border-[#26263a] py-1.5 px-1.5">
                        <button
                          onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#f0a3a3] hover:bg-[rgba(226,75,74,0.1)]"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </header>

          <main className="flex-1 overflow-x-clip">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-5 md:px-6 md:pb-8 max-w-6xl"
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