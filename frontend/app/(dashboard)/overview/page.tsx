"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/ui/empty-state";
import { DepartmentChart, AttendanceTrendChart } from "@/components/ui/overview-charts";
import { CalendarOff, CalendarCheck2 } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_DEPT_DATA = [
  { name: 'Engineering', value: 12 },
  { name: 'HR', value: 3 },
  { name: 'Sales', value: 8 },
  { name: 'Marketing', value: 5 },
];

const MOCK_ATTENDANCE_TREND = [
  { date: 'Mon', present: 24, absent: 4 },
  { date: 'Tue', present: 26, absent: 2 },
  { date: 'Wed', present: 25, absent: 3 },
  { date: 'Thu', present: 27, absent: 1 },
  { date: 'Fri', present: 28, absent: 0 },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface Employee { id: number; firstName: string; lastName: string; status: string; departmentName?: string; designation?: string; email?: string; employeeCode?: string; }
interface Department { id: number; name: string; headName?: string; employeeCount?: number; }
interface LeaveRequestRecord { id: number; employeeName?: string; leaveType: string; startDate: string; endDate: string; status: string; }
interface PageShape<T> { content: T[]; totalElements: number; }
interface AttendanceRecord { id?: number; employeeName?: string; employeeCode?: string; clockIn: string; status?: string; }
interface AttendancePage { content: AttendanceRecord[]; totalElements: number; }

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-5 shadow-sm flex flex-col gap-1 hover:border-lineHover transition-colors">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={`font-display text-3xl font-bold ${accent ?? "text-ink"}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-line shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-line rounded w-1/3" />
        <div className="h-2.5 bg-line rounded w-1/4" />
      </div>
      <div className="h-5 w-14 bg-line rounded-full" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  if (s === "PENDING")
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amberBg text-amberTxt border border-amberPri/20">Pending</span>;
  if (s === "APPROVED")
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emeraldBg text-emeraldTxt border border-emeraldPri/20">Approved</span>;
  if (s === "PRESENT")
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emeraldBg text-emeraldTxt border border-emeraldPri/20">Present</span>;
  if (s === "LATE")
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amberBg text-amberTxt border border-amberPri/20">Late</span>;
  if (s === "ABSENT")
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-roseBg text-roseTxt border border-rosePri/20">Absent</span>;
  return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-line text-muted">{status}</span>;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["bg-sky-600","bg-indigo-600","bg-violet-600","bg-emerald-600","bg-amber-600","bg-rose-600"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const { role } = useAuth();
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const [empCount, setEmpCount] = useState<number | null>(null);
  const [deptCount, setDeptCount] = useState<number | null>(null);
  const [pendingLeave, setPendingLeave] = useState<number | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [recentLeave, setRecentLeave] = useState<LeaveRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canReview = role === "ADMIN" || role === "HR" || role === "MANAGER";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          api.get<PageShape<Employee>>("/employees", { size: 1 }),
          api.get<PageShape<Department>>("/departments", { size: 1 }),
          canReview
            ? api.get<PageShape<LeaveRequestRecord>>("/leave/requests", { status: "PENDING", size: 1 })
            : api.get<PageShape<LeaveRequestRecord>>("/leave/requests/me", { status: "PENDING", size: 1 }),
          api.get<AttendancePage>("/attendance", { size: 5, sort: "clockIn,desc" }),
          canReview
            ? api.get<PageShape<LeaveRequestRecord>>("/leave/requests", { size: 5, sort: "createdAt,desc" })
            : api.get<PageShape<LeaveRequestRecord>>("/leave/requests/me", { size: 5, sort: "createdAt,desc" }),
        ]);

        if (cancelled) return;

        if (results[0].status === "fulfilled") setEmpCount(results[0].value?.totalElements ?? null);
        if (results[1].status === "fulfilled") setDeptCount(results[1].value?.totalElements ?? null);
        if (results[2].status === "fulfilled") setPendingLeave(results[2].value?.totalElements ?? null);
        if (results[3].status === "fulfilled") setTodayAttendance(results[3].value?.content ?? []);
        if (results[4].status === "fulfilled") setRecentLeave(results[4].value?.content ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [canReview]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Overview</h1>
          <p className="text-xs text-muted mt-0.5">{today}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rosePri/30 bg-roseBg px-4 py-3 text-sm text-roseTxt">
          {error} — make sure the backend is running.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={empCount ?? "—"}
          sub="Across all departments"
          accent="text-sky-600"
        />
        <StatCard
          label="Departments"
          value={deptCount ?? "—"}
          sub="Active units"
          accent="text-indigo-600"
        />
        <StatCard
          label="Pending Leave"
          value={pendingLeave ?? "—"}
          sub={canReview ? "Awaiting your review" : "Your pending requests"}
          accent={pendingLeave ? "text-amberTxt" : "text-ink"}
        />
        <StatCard
          label="Live Clock"
          value={new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata",
          })}
          sub="India Standard Time"
          accent="text-emeraldTxt"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden p-5">
          <h2 className="font-semibold text-sm text-ink mb-4">Department Distribution</h2>
          <DepartmentChart data={MOCK_DEPT_DATA} />
        </div>
        <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden p-5">
          <h2 className="font-semibold text-sm text-ink mb-4">Attendance Trend (This Week)</h2>
          <AttendanceTrendChart data={MOCK_ATTENDANCE_TREND} />
        </div>
      </div>

      {/* Two-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Attendance */}
        <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-line flex items-center justify-between">
            <h2 className="font-semibold text-sm text-ink">Recent Attendance</h2>
            <Link href="/attendance" className="text-xs text-accent hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div>{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : todayAttendance.length === 0 ? (
            <EmptyState 
              icon={<CalendarCheck2 size={32} />}
              title="All Caught Up!"
              description="No attendance records have been logged yet today."
            />
          ) : (
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            >
              {todayAttendance.map((rec, i) => {
                const name = rec.employeeName ?? rec.employeeCode ?? "Employee";
                const time = rec.clockIn
                  ? new Date(rec.clockIn).toLocaleTimeString("en-IN", {
                      hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata",
                    })
                  : "—";
                return (
                  <motion.li 
                    variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                    key={rec.id ?? i} 
                    className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-canvas transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${avatarColor(name)} text-white text-xs font-semibold flex items-center justify-center shrink-0`}>
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{name}</div>
                      <div className="text-xs text-muted font-mono">{time}</div>
                    </div>
                    <StatusBadge status={rec.status ?? "PRESENT"} />
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </div>

        {/* Recent Leave */}
        <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-line flex items-center justify-between">
            <h2 className="font-semibold text-sm text-ink">
              {canReview ? "Team Leave Requests" : "My Leave Requests"}
            </h2>
            <Link href={canReview ? "/leave/team" : "/leave"} className="text-xs text-accent hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <div>{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : recentLeave.length === 0 ? (
            <EmptyState 
              icon={<CalendarOff size={32} />}
              title="No Leave Requests"
              description="Looks like everyone is geared up and ready for work!"
            />
          ) : (
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            >
              {recentLeave.map((req, i) => {
                const name = req.employeeName ?? "Me";
                const range = `${new Date(req.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${new Date(req.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
                return (
                  <motion.li 
                    variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                    key={req.id ?? i} 
                    className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-canvas transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${avatarColor(name)} text-white text-xs font-semibold flex items-center justify-center shrink-0`}>
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{name}</div>
                      <div className="text-xs text-muted capitalize">{req.leaveType?.toLowerCase().replace("_", " ")} · {range}</div>
                    </div>
                    <StatusBadge status={req.status} />
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </div>
      </div>

    </div>
  );
}
