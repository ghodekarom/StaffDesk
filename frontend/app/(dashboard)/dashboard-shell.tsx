"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { visibleNavItems } from "@/lib/nav-config";
import { api } from "@/lib/api";
import { ToastProvider } from "@/components/ui/toast-notifications";
import { CommandPalette } from "@/components/ui/command-palette";
import { EmployeeDrawer, EmployeeDrawerData } from "@/components/ui/employee-drawer";
import { Employee } from "@/types/employee";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarOff,
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
  "/settings": <Settings size={16} />,
};

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/employees": "Employees",
  "/departments": "Departments",
  "/attendance": "Attendance",
  "/leave": "Leave",
  "/settings": "Settings",
};

function getPageTitle(path: string): string {
  if (path.startsWith("/attendance")) return "Attendance";
  if (path.startsWith("/leave")) return "Leave";
  return PAGE_TITLES[path] ?? "StaffDesk";
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

interface LeaveRequestPage {
  totalElements: number;
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

  const navLink = (item: (typeof items)[0], onClick?: () => void) => {
    const active =
      item.href === "/overview"
        ? pathname === "/overview"
        : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
          active
            ? "bg-[rgba(139,127,251,0.16)] text-[#c9c2ff]"
            : "text-[#9d9cae] hover:text-[#e6e6ef] hover:bg-white/[0.04]"
        }`}
      >
        {NAV_ICONS[item.href]}
        <span>{item.label}</span>
        {item.href === "/leave" && pendingLeaveCount !== null && pendingLeaveCount > 0 && (
          <span className="ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-[rgba(237,161,0,0.15)] text-[#f7c98f]">
            {pendingLeaveCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#12121c] text-[#e6e6ef]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex sticky top-0 h-screen w-[168px] flex-col shrink-0 z-50 p-4 justify-between">
          <div>
            <div className="flex items-center gap-2 px-0 pt-1.5 pb-5">
              <div className="w-[26px] h-[26px] rounded-[7px] bg-gradient-to-br from-[#8b7ffb] to-[#22d3c0] flex items-center justify-center text-[13px] font-medium text-[#0d0d16]">
                S
              </div>
              <span className="text-[15px] font-medium">StaffDesk</span>
            </div>
            <nav className="flex flex-col gap-0.5">
              {items.map((item) => navLink(item))}
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
          <header className="hidden md:flex items-center justify-between px-6 h-14 shrink-0">
            <span className="text-[17px] font-medium">{getPageTitle(pathname)}</span>
            <div className="flex items-center gap-3 text-[#9d9cae]">
              <button
                onClick={() => setCmdOpen(true)}
                className="hover:text-[#e6e6ef] transition-colors"
                title="Quick search (Ctrl+K)"
              >
                <Bell size={17} />
              </button>
              <div className="w-[26px] h-[26px] rounded-full bg-[#8b7ffb] flex items-center justify-center text-[11px] font-medium text-[#0d0d16]">
                {initials(employeeName)}
              </div>
            </div>
          </header>

          {/* Mobile Topbar */}
          <header className="md:hidden flex items-center justify-between px-5 h-14 border-b border-[#26263a] shrink-0 sticky top-0 z-40 bg-[#12121c]">
            <div className="flex items-center gap-2">
              <div className="w-[26px] h-[26px] rounded-[7px] bg-gradient-to-br from-[#8b7ffb] to-[#22d3c0] flex items-center justify-center text-[13px] font-medium text-[#0d0d16]">
                S
              </div>
              <span className="text-[15px] font-medium">StaffDesk</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
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
                        {items.map((item) => navLink(item, () => setMobileMenuOpen(false)))}
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
