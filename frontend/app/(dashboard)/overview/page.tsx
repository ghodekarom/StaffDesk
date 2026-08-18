"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { DepartmentChart, AttendanceTrendChart, Sparkline } from "@/components/ui/overview-charts";
import { CalendarOff, CalendarCheck2, Clock, Users, RefreshCw } from "lucide-react";
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
    <div className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-line shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-line rounded w-1/3" />
        <div className="h-2.5 bg-line rounded w-1/4" />
      </div>
      <div className="h-5 w-14 bg-line rounded-full" />
    </div>
  );
}

// Skeleton for the KPI/gauge cards, so they no longer render an instant
// fallback number (e.g. `empCount ?? 184`) during the initial fetch.
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`aspect-square sm:aspect-auto flex flex-col justify-center sm:block bg-card border border-line rounded-2xl p-3 sm:p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-line rounded w-1/2 mb-3" />
      <div className="h-7 bg-line rounded w-1/3" />
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
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amberBg text-amberTxt border border-amberPri/20">Pending</span>;
  if (s === "APPROVED" || s === "PRESENT")
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-presentBg text-status-present border border-status-present/20">Approved</span>;
  if (s === "LATE")
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-lateBg text-status-late border border-status-late/20">Late</span>;
  if (s === "ABSENT")
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-roseBg text-roseTxt border border-rosePri/20">Absent</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-line text-muted">{status}</span>;
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
  // `loading` is only true for the very first fetch — a manual refresh uses
  // `refreshing` instead so the page doesn't blank out to skeletons every
  // time someone clicks "Refresh" on data that's already on screen.
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // Each section fails independently: a broken attendance call shouldn't
  // blank out the dashboard stats, and vice versa. Each also gets its own
  // retry so recovering from one failure doesn't force a full-page refetch.
  const [error, setError] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const canReview = role === "ADMIN" || role === "HR" || role === "MANAGER";

  // Derived, not fetched: the pie chart wants {name, value} pairs, the
  // backend returns {name, employeeCount} — a plain rename, not a fallback.
  const deptChartData = (summary?.departmentBreakdown ?? []).map((d) => ({
    name: d.name,
    value: d.employeeCount,
  }));

  async function fetchSummary() {
    setError(null);
    try {
      const data = await api.get<DashboardSummary>("/dashboard/summary");
      setSummary(data);
    } catch (err) {
      // User-facing wording only — no mention of the backend server, which
      // means nothing to someone who isn't the person running it locally.
      setError(err instanceof ApiError ? err.message : "We couldn't load the dashboard stats.");
    }
  }

  async function fetchAttendance() {
    setAttendanceError(null);
    try {
      const data = await api.get<AttendancePage>("/attendance/recent", { size: 5, sort: "attendanceDate,desc" });
      setTodayAttendance(data?.content ?? []);
    } catch (err) {
      setAttendanceError(err instanceof ApiError ? err.message : "We couldn't load recent attendance.");
    }
  }

  async function fetchLeave() {
    setLeaveError(null);
    try {
      const data = canReview
        ? await api.get<PageShape<LeaveRequestRecord>>("/leave/requests", { size: 5, sort: "createdAt,desc" })
        : await api.get<PageShape<LeaveRequestRecord>>("/leave/requests/me", { size: 5, sort: "createdAt,desc" });
      setRecentLeave(data?.content ?? []);
    } catch (err) {
      setLeaveError(err instanceof ApiError ? err.message : "We couldn't load recent leave requests.");
    }
  }

  async function loadAll() {
    setRefreshing(true);
    await Promise.all([fetchSummary(), fetchAttendance(), fetchLeave()]);
    setLastUpdated(new Date());
    setRefreshing(false);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReview]);

  const hasEmployees = !!summary && summary.totalEmployees > 0;
  const totalForBreakdown = summary?.totalEmployees ?? 0;
  const accountedFor = summary
    ? summary.presentToday + summary.lateToday + summary.absentToday
    : 0;
  const notYetRecorded = Math.max(0, totalForBreakdown - accountedFor);

  return (
    <div className="space-y-6 animate-fade-up">

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
          <p className="text-sm text-muted">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted">
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
            </span>
          )}
          <button
            onClick={loadAll}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink border border-line rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rosePri/20 bg-roseBg px-4 py-3 text-sm text-roseTxt">
          <span>We couldn&apos;t load the dashboard stats. {error}</span>
          <button onClick={fetchSummary} className="text-xs font-medium underline shrink-0">Retry</button>
        </div>
      )}

      {!loading && summary && !hasEmployees && (
        <EmptyState
          icon={<Users size={32} />}
          title="Let's get your team set up"
          description="Add your first employee to start tracking attendance, leave, and payroll here."
          action={<Link href="/employees" className="text-sm font-medium text-accent hover:underline">Add employee →</Link>}
        />
      )}

      {(loading || hasEmployees) && (
        <>
          {/* ─── SECTION 1: KPI cards + real attendance-status breakdown ─────────── */}
          {/* 2x2 square grid on mobile (each card's own tap target, easy
              thumb reach), settling into a single row of 4 rectangular
              cards from sm upward where there's room to breathe. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {loading ? (
              <>
                <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
              </>
            ) : (
              <>
                <Link href="/employees" className="aspect-square sm:aspect-auto flex flex-col justify-between sm:block bg-card border border-line hover:border-lineHover hover:-translate-y-0.5 transition rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-muted">
                    <Users className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" /> <span className="truncate">Active employees</span>
                  </div>
                  <div className="text-3xl sm:text-2xl font-bold text-ink mt-1.5 sm:mt-2">
                    <CountUp value={summary?.totalEmployees ?? 0} />
                  </div>
                  <div className="text-xs sm:text-[11px] text-emeraldPri mt-1">
                    {summary && summary.newHiresThisMonth > 0
                      ? `+${summary.newHiresThisMonth} this month`
                      : "No new hires this month"}
                  </div>
                </Link>

                <Link href="/attendance" className="aspect-square sm:aspect-auto flex flex-col justify-between sm:block bg-card border border-line hover:border-lineHover hover:-translate-y-0.5 transition rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-muted">
                    <CalendarCheck2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" /> <span className="truncate">Present today</span>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-2xl font-bold text-ink mt-1.5 sm:mt-2">
                      <CountUp value={summary?.presentToday ?? 0} />
                      <span className="text-sm text-muted font-normal"> / {summary?.totalEmployees ?? 0}</span>
                    </div>
                    {/* 7-day present-count trend, from the same attendanceTrend
                        data the full chart below already has — so a single
                        static number doesn't hide whether attendance is
                        climbing or sliding. */}
                    {summary && summary.attendanceTrend.length > 1 && (
                      <Sparkline data={summary.attendanceTrend.map((t) => t.present)} color="#34d399" />
                    )}
                  </div>
                  <div className="text-xs sm:text-[11px] text-muted mt-1">
                    {summary && summary.totalEmployees > 0
                      ? `${Math.round((summary.presentToday / summary.totalEmployees) * 100)}% attendance`
                      : "No attendance logged yet"}
                  </div>
                </Link>

                <div className="aspect-square sm:aspect-auto flex flex-col justify-between sm:block bg-card border border-line rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-muted">
                    <Clock className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" /> <span className="truncate">Hours logged today</span>
                  </div>
                  <div className="text-3xl sm:text-2xl font-bold text-ink mt-1.5 sm:mt-2">
                    <CountUp value={summary?.hoursLoggedToday ?? 0} decimals={1} />h
                  </div>
                  <div className="text-xs sm:text-[11px] text-muted mt-1">Sum of completed clock-outs</div>
                </div>

                <div className="aspect-square sm:aspect-auto flex flex-col justify-between sm:block bg-card border border-line rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-muted">
                    <CalendarOff className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" /> <span className="truncate">Pending leave</span>
                  </div>
                  <div className="text-3xl sm:text-2xl font-bold text-ink mt-1.5 sm:mt-2">
                    <CountUp value={summary?.pendingLeaveCount ?? 0} />
                  </div>
                  <div className="text-xs sm:text-[11px] mt-1">
                    {summary && summary.pendingLeaveCount > 0 ? (
                      <Link href={canReview ? "/leave/team" : "/leave"} className="text-amberPri hover:underline">
                        Needs review →
                      </Link>
                    ) : (
                      <span className="text-muted">All caught up</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Today's attendance status split — real counts from /dashboard/summary,
              not a decorative gauge with a hardcoded percentage. Includes an
              explicit "not yet recorded" segment so the bar always sums to
              100% of totalEmployees instead of leaving an unexplained gap. */}
          {!loading && summary && summary.totalEmployees > 0 && (
            <div className="bg-card border border-line rounded-2xl p-6">
              <div className="text-[15px] font-bold text-ink mb-4">Today&apos;s attendance breakdown</div>
              <div className="flex h-3 rounded-full overflow-hidden bg-canvas">
                {summary.presentToday > 0 && (
                  <div className="bg-status-present" style={{ width: `${(summary.presentToday / totalForBreakdown) * 100}%` }} />
                )}
                {summary.lateToday > 0 && (
                  <div className="bg-status-late" style={{ width: `${(summary.lateToday / totalForBreakdown) * 100}%` }} />
                )}
                {summary.absentToday > 0 && (
                  <div className="bg-rosePri" style={{ width: `${(summary.absentToday / totalForBreakdown) * 100}%` }} />
                )}
                {notYetRecorded > 0 && (
                  <div className="bg-line" style={{ width: `${(notYetRecorded / totalForBreakdown) * 100}%` }} />
                )}
              </div>
              <div className="flex items-center gap-5 mt-3 text-xs text-muted flex-wrap">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-present" /> Present ({summary.presentToday})</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-status-late" /> Late ({summary.lateToday})</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rosePri" /> Absent ({summary.absentToday})</span>
                {notYetRecorded > 0 && (
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-line" /> Not yet recorded ({notYetRecorded})</span>
                )}
              </div>
            </div>
          )}

          {/* ─── SECTION 2: Dynamic Charts from API ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            <div className="bg-card border border-line rounded-2xl p-6 shadow-sm overflow-hidden">
              <h2 className="font-bold text-sm text-ink mb-4">Department Distribution</h2>
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
            <div className="bg-card border border-line rounded-2xl p-6 shadow-sm overflow-hidden">
              <h2 className="font-bold text-sm text-ink mb-4">Attendance Trend (Last 7 Days)</h2>
              <AttendanceTrendChart data={summary?.attendanceTrend ?? []} />
            </div>
          </div>
        </>
      )}

      {/* ─── SECTION 3: Live API Attendance & Leave Tables ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Attendance */}
        <div className="bg-card border border-line rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-bold text-sm text-ink">Recent Attendance Logs</h2>
            <Link href="/attendance" className="text-xs text-accent hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div>{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : attendanceError ? (
            <ErrorState message={attendanceError} onRetry={fetchAttendance} />
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
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-line last:border-0 hover:bg-canvas transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink truncate">{name}</div>
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
        <div className="bg-card border border-line rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-bold text-sm text-ink">
              {canReview ? "Team Leave Requests" : "My Leave Requests"}
            </h2>
            <Link href={canReview ? "/leave/team" : "/leave"} className="text-xs text-accent hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <div>{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : leaveError ? (
            <ErrorState message={leaveError} onRetry={fetchLeave} />
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
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-line last:border-0 hover:bg-canvas transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink truncate">{name}</div>
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