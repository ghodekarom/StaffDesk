"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/ui/empty-state";
import { DepartmentChart, AttendanceTrendChart } from "@/components/ui/overview-charts";
import { CalendarOff, CalendarCheck2, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LeaveRequestRecord { id: number; employeeName?: string; leaveType: string; startDate: string; endDate: string; status: string; }
interface PageShape<T> { content: T[]; totalElements: number; }
interface AttendanceRecord { id?: number; employeeName?: string; employeeCode?: string; clockIn: string; status?: string; }
interface AttendancePage { content: AttendanceRecord[]; totalElements: number; }

// Shape of GET /dashboard/summary — every field here is a real, server-side
// aggregate (see DashboardService on the backend). Nothing on this page
// derives a stat from Math.random(), a hardcoded percentage, or client-side
// arithmetic on a paginated list anymore.
interface DashboardSummary {
  totalEmployees: number;
  newHiresThisMonth: number;
  totalDepartments: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  hoursLoggedToday: number;
  pendingLeaveCount: number;
  departmentBreakdown: { name: string; employeeCount: number }[];
  attendanceTrend: { date: string; present: number; absent: number; late: number; halfDay: number }[];
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-white/10 rounded w-1/3" />
        <div className="h-2.5 bg-white/10 rounded w-1/4" />
      </div>
      <div className="h-5 w-14 bg-white/10 rounded-full" />
    </div>
  );
}

// Skeleton for the KPI/gauge cards, so they no longer render an instant
// fallback number (e.g. `empCount ?? 184`) during the initial fetch.
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-[#121826] border border-white/5 rounded-2xl p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
      <div className="h-7 bg-white/10 rounded w-1/3" />
    </div>
  );
}

// Animated count-up for KPI numbers — confirms visually that the number
// just arrived from the network rather than being static.
function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 600;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(value * (1 - Math.pow(1 - progress, 3))); // ease-out cubic
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{display.toFixed(decimals)}</>;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  if (s === "PENDING")
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
  if (s === "APPROVED" || s === "PRESENT")
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>;
  if (s === "LATE")
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Late</span>;
  if (s === "ABSENT")
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Absent</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-slate-400">{status}</span>;
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

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [recentLeave, setRecentLeave] = useState<LeaveRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canReview = role === "ADMIN" || role === "HR" || role === "MANAGER";

  // Derived, not fetched: the pie chart wants {name, value} pairs, the
  // backend returns {name, employeeCount} — a plain rename, not a fallback.
  const deptChartData = (summary?.departmentBreakdown ?? []).map((d) => ({
    name: d.name,
    value: d.employeeCount,
  }));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          api.get<DashboardSummary>("/dashboard/summary"),
          api.get<AttendancePage>("/attendance", { size: 5, sort: "clockIn,desc" }),
          canReview
            ? api.get<PageShape<LeaveRequestRecord>>("/leave/requests", { size: 5, sort: "createdAt,desc" })
            : api.get<PageShape<LeaveRequestRecord>>("/leave/requests/me", { size: 5, sort: "createdAt,desc" }),
        ]);

        if (cancelled) return;

        if (results[0].status === "fulfilled") {
          setSummary(results[0].value);
        } else {
          setError(
            results[0].reason instanceof ApiError
              ? results[0].reason.message
              : "Couldn't load dashboard stats."
          );
        }

        if (results[1].status === "fulfilled") {
          setTodayAttendance(results[1].value?.content ?? []);
        }

        if (results[2].status === "fulfilled") {
          setRecentLeave(results[2].value?.content ?? []);
        }
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

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
        <p className="text-sm text-muted">{today}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error} — make sure the backend server is running.
        </div>
      )}

      {/* ─── SECTION 1: KPI cards + real attendance-status breakdown ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-[#121826] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Users className="w-3.5 h-3.5" /> Active employees
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                <CountUp value={summary?.totalEmployees ?? 0} />
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">
                {summary && summary.newHiresThisMonth > 0
                  ? `+${summary.newHiresThisMonth} this month`
                  : "No new hires this month"}
              </div>
            </div>

            <div className="bg-[#121826] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <CalendarCheck2 className="w-3.5 h-3.5" /> Present today
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                <CountUp value={summary?.presentToday ?? 0} />
                <span className="text-sm text-slate-500 font-normal"> / {summary?.totalEmployees ?? 0}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {summary && summary.totalEmployees > 0
                  ? `${Math.round((summary.presentToday / summary.totalEmployees) * 100)}% attendance`
                  : "No attendance logged yet"}
              </div>
            </div>

            <div className="bg-[#121826] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Clock className="w-3.5 h-3.5" /> Hours logged today
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                <CountUp value={summary?.hoursLoggedToday ?? 0} decimals={1} />h
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Sum of completed clock-outs</div>
            </div>

            <div className="bg-[#121826] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <CalendarOff className="w-3.5 h-3.5" /> Pending leave
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                <CountUp value={summary?.pendingLeaveCount ?? 0} />
              </div>
              <div className="text-[11px] mt-1">
                {summary && summary.pendingLeaveCount > 0 ? (
                  <Link href={canReview ? "/leave/team" : "/leave"} className="text-amber-400 hover:underline">
                    Needs review →
                  </Link>
                ) : (
                  <span className="text-slate-500">All caught up</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Today's attendance status split — real counts from /dashboard/summary,
          not a decorative gauge with a hardcoded percentage. */}
      {!loading && summary && (summary.presentToday + summary.absentToday + summary.lateToday > 0) && (
        <div className="bg-[#121826] border border-white/5 rounded-2xl p-6">
          <div className="text-[15px] font-bold text-white mb-4">Today&apos;s attendance breakdown</div>
          <div className="flex h-3 rounded-full overflow-hidden bg-[#1A2234]">
            {summary.presentToday > 0 && (
              <div className="bg-emerald-500" style={{ width: `${(summary.presentToday / summary.totalEmployees) * 100}%` }} />
            )}
            {summary.lateToday > 0 && (
              <div className="bg-amber-500" style={{ width: `${(summary.lateToday / summary.totalEmployees) * 100}%` }} />
            )}
            {summary.absentToday > 0 && (
              <div className="bg-rose-500" style={{ width: `${(summary.absentToday / summary.totalEmployees) * 100}%` }} />
            )}
          </div>
          <div className="flex items-center gap-5 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Present ({summary.presentToday})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Late ({summary.lateToday})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Absent ({summary.absentToday})</span>
          </div>
        </div>
      )}


      {/* ─── SECTION 2: Dynamic Charts from API ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <div className="bg-[#121826] border border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden">
          <h2 className="font-bold text-sm text-white mb-4">Department Distribution</h2>
          {!loading && deptChartData.length === 0 ? (
            <EmptyState
              icon={<Users size={32} />}
              title="No Departments Yet"
              description="Add a department and assign employees to see the breakdown here."
            />
          ) : (
            <DepartmentChart data={deptChartData} />
          )}
        </div>
        <div className="bg-[#121826] border border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden">
          <h2 className="font-bold text-sm text-white mb-4">Attendance Trend (Last 7 Days)</h2>
          <AttendanceTrendChart data={summary?.attendanceTrend ?? []} />
        </div>
      </div>

      {/* ─── SECTION 3: Live API Attendance & Leave Tables ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Attendance */}
        <div className="bg-[#121826] border border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">Recent Attendance Logs</h2>
            <Link href="/attendance" className="text-xs text-cyan-400 hover:underline">View all →</Link>
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
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{name}</div>
                      <div className="text-xs text-slate-400 font-mono">{time}</div>
                    </div>
                    <StatusBadge status={rec.status ?? "PRESENT"} />
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </div>

        {/* Recent Leave */}
        <div className="bg-[#121826] border border-white/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">
              {canReview ? "Team Leave Requests" : "My Leave Requests"}
            </h2>
            <Link href={canReview ? "/leave/team" : "/leave"} className="text-xs text-cyan-400 hover:underline">
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
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{name}</div>
                      <div className="text-xs text-slate-400 capitalize">{req.leaveType?.toLowerCase().replace("_", " ")} · {range}</div>
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