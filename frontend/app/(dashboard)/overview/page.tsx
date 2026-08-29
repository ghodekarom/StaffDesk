"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CompactAttendanceTrendChart, Sparkline } from "@/components/ui/overview-charts";
import { CalendarOff, CalendarCheck2, Clock, Users, RefreshCw, AlertTriangle, UserX, CalendarClock, HelpCircle, ArrowUp, ArrowDown, CalendarDays, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LeaveRequestRecord { id: number; employeeName?: string; leaveType: string; startDate: string; endDate: string; status: string; }
interface PageShape<T> { content: T[]; totalElements: number; }
interface AttendanceRecord { id?: number; employeeName?: string; employeeCode?: string; departmentName?: string | null; clockIn: string; status?: string; }
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
  // Which range the backend actually computed this response over — set
  // authoritatively by DashboardService, not just an echo of what the
  // frontend asked for.
  appliedRange: "today" | "week" | "month";
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
  const { role, isInitializing } = useAuth();
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
  // Which list the mobile "Recent Activity" tabs are showing — purely a
  // view toggle over the same todayAttendance/recentLeave state already
  // fetched below, not a separate data source.
  const [activityTab, setActivityTab] = useState<"attendance" | "leave">("attendance");

  // Period selector for the header dropdown. /dashboard/summary accepts a
  // `range` query param (today/week/month — see DashboardController +
  // DashboardService) and returns the matching aggregates plus
  // `appliedRange` confirming what it actually computed.
  const PERIOD_OPTIONS = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ] as const;
  type Period = (typeof PERIOD_OPTIONS)[number]["value"];
  const [period, setPeriod] = useState<Period>("today");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setPeriodOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const canReview = role === "ADMIN" || role === "HR" || role === "MANAGER";

  // Percentage view of the same attendanceTrend the full chart uses, for the
  // compact chart — derived here (present / current headcount), not
  // fetched separately or hardcoded. Only rendered when the underlying trend
  // data actually exists.
  const pctTrendData =
    summary && summary.totalEmployees > 0
      ? summary.attendanceTrend.map((t) => ({
          date: t.date,
          pct: (t.present / summary.totalEmployees) * 100,
        }))
      : [];
  const todayPct = pctTrendData.length > 0 ? pctTrendData[pctTrendData.length - 1].pct : null;
  const priorPct = pctTrendData.length > 1 ? pctTrendData.slice(0, -1) : [];
  const priorAvgPct = priorPct.length > 0 ? priorPct.reduce((sum, d) => sum + d.pct, 0) / priorPct.length : null;
  const pctDelta = todayPct !== null && priorAvgPct !== null ? todayPct - priorAvgPct : null;

  async function fetchSummary() {
    setError(null);
    try {
      const data = await api.get<DashboardSummary>("/dashboard/summary", { range: period }, { fresh: true });
      setSummary(data);
    } catch (err) {
      // User-facing wording only — no mention of the backend server, which
      // means nothing to someone who isn't the person running it locally.
      setError(err instanceof ApiError ? err.message : "We couldn't load the dashboard stats.");
    }
  }

  async function fetchAttendance() {
    // Issue #16: the backend restricts GET /attendance/recent to
    // ADMIN/HR/MANAGER (@PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    // in AttendanceController). Previously this was called unconditionally,
    // so an EMPLOYEE always hit a 403 here and saw a generic "Couldn't load
    // this" error. Branch by role the same way fetchLeave() already does:
    // reviewers get the org-wide feed, everyone else gets an empty list
    // instead of a failed call. (There's no confirmed EMPLOYEE-scoped
    // equivalent like /attendance/me yet -- swap this branch to call that
    // if/when one exists, instead of just skipping the fetch.)
    if (!canReview) {
      setAttendanceError(null);
      setTodayAttendance([]);
      return;
    }
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

  // Root cause of the "401 on every load" bug: this effect is a child of
  // AuthProvider, and React fires child effects before parent effects on
  // mount. Without the isInitializing guard, loadAll() would fire before
  // AuthProvider's own effect has registered the real token getter or
  // finished silently refreshing the access token from the httpOnly
  // cookie -- so the very first request always went out with no
  // Authorization header at all, regardless of whether the session was
  // actually valid. Waiting for isInitializing to clear (AuthProvider
  // exposes it for exactly this) ensures a real token exists before the
  // first fetch fires.
  useEffect(() => {
    if (isInitializing) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReview, isInitializing, period]);

  const hasEmployees = !!summary && summary.totalEmployees > 0;
  const totalForBreakdown = summary?.totalEmployees ?? 0;
  const accountedFor = summary
    ? summary.presentToday + summary.lateToday + summary.absentToday
    : 0;
  const notYetRecorded = Math.max(0, totalForBreakdown - accountedFor);

  // Human-readable phrase for the currently applied range, used in card
  // captions ("Present today" / "Present this week" / "Present this
  // month"). Reads `summary.appliedRange` (what the backend actually
  // computed) rather than the local `period` state, so a card never
  // claims a period the response didn't confirm.
  const appliedRange = summary?.appliedRange ?? period;
  const periodLabel = appliedRange === "week" ? "this week" : appliedRange === "month" ? "this month" : "today";


  return (
    <div className="space-y-6 animate-fade-up">

      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
            <p className="text-sm text-muted mt-0.5">{today}</p>
          </div>
          {/* Real dropdown: opens a menu, tracks selection in state, and
              refetches /dashboard/summary with the chosen range on every
              change (see the `period` dependency on the effect above). */}
          <div className="relative shrink-0" ref={periodRef}>
            <button
              type="button"
              onClick={() => setPeriodOpen((o) => !o)}
              className="flex items-center gap-1.5 text-xs font-medium text-ink border border-line rounded-lg px-3 py-1.5"
              aria-haspopup="listbox"
              aria-expanded={periodOpen}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {PERIOD_OPTIONS.find((p) => p.value === period)?.label}
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${periodOpen ? "rotate-180" : ""}`} />
            </button>
            {periodOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-1.5 w-40 bg-card border border-line rounded-lg shadow-lg overflow-hidden z-10"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={period === opt.value}
                    onClick={() => {
                      setPeriod(opt.value);
                      setPeriodOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                      period === opt.value
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-ink hover:bg-canvas"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          {lastUpdated && (
            <span className="text-xs text-muted">
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
            </span>
          )}
          <button
            onClick={loadAll}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-ink transition-colors disabled:opacity-50"
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
                <Link href="/attendance" className="aspect-square sm:aspect-auto flex flex-col justify-start gap-1.5 sm:block bg-card border border-line hover:border-lineHover hover:-translate-y-0.5 transition rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <CalendarCheck2 className="w-4 h-4 text-emeraldTxt shrink-0" strokeWidth={2} />
                    <span className="truncate">Present {periodLabel}</span>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-2xl font-bold text-ink mt-1.5 sm:mt-2 leading-none">
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
                  <div className="text-xs sm:text-[11px] text-muted">
                    {summary && summary.totalEmployees > 0
                      ? `${Math.round((summary.presentToday / summary.totalEmployees) * 100)}% attendance`
                      : "No attendance logged yet"}
                  </div>
                </Link>

                <Link href="/employees" className="relative overflow-hidden aspect-square sm:aspect-auto flex flex-col justify-between sm:block bg-card border border-line hover:border-lineHover hover:-translate-y-0.5 transition rounded-2xl p-4 sm:p-5">
                  {/* Purely decorative watermark, matching the reference design —
                      doesn't carry data, so it's safe to render regardless of
                      loading/empty state. */}
                  <Users className="pointer-events-none absolute -bottom-3 -right-3 w-20 h-20 text-sky-500/10" strokeWidth={1.5} aria-hidden="true" />
                  <div className="relative flex items-center gap-2 text-xs font-medium text-muted">
                    <Users className="w-4 h-4 text-sky-500 shrink-0" strokeWidth={2} />
                    <span className="truncate">Active employees</span>
                  </div>
                  <div className="relative text-3xl sm:text-2xl font-bold text-ink mt-1.5 sm:mt-2 leading-none">
                    <CountUp value={summary?.totalEmployees ?? 0} />
                  </div>
                  <div className="relative text-xs sm:text-[11px] text-emeraldPri mt-1">
                    {summary && summary.newHiresThisMonth > 0
                      ? `+${summary.newHiresThisMonth} this month`
                      : "No new hires this month"}
                  </div>
                </Link>

                <div className="aspect-square sm:aspect-auto flex flex-col justify-between sm:block bg-card border border-line rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <Clock className="w-4 h-4 text-violet-500 shrink-0" strokeWidth={2} />
                    <span className="truncate">Hours logged {periodLabel}</span>
                  </div>
                  <div className="text-3xl sm:text-2xl font-bold text-ink mt-1.5 sm:mt-2 leading-none">
                    <CountUp value={summary?.hoursLoggedToday ?? 0} decimals={1} />h
                  </div>
                  <div className="text-xs sm:text-[11px] text-muted mt-1">Sum of completed clock-outs</div>
                </div>

                <div className="aspect-square sm:aspect-auto flex flex-col justify-between sm:block bg-card border border-line rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <CalendarOff className="w-4 h-4 text-amberTxt shrink-0" strokeWidth={2} />
                    <span className="truncate">Pending leave</span>
                  </div>
                  <div className="text-3xl sm:text-2xl font-bold text-ink mt-1.5 sm:mt-2 leading-none">
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

          {/* Needs Attention — condenses the same four counts as the old
              desktop breakdown bar (absent, late, pending leave,
              not-yet-recorded) into one compact card, now used at every
              screen size. */}
          {!loading && summary && summary.totalEmployees > 0 && (
            <div className="bg-card border border-line rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-ink">
                  <AlertTriangle className="w-4 h-4 text-amberPri" />
                  Needs Attention
                </div>
                <Link href="/attendance" className="text-xs text-accent hover:underline shrink-0">
                  Review all →
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center text-center">
                  <UserX className="w-5 h-5 text-roseTxt mb-1.5" strokeWidth={2} />
                  <div className="text-base font-bold text-ink"><CountUp value={summary.absentToday} /></div>
                  <div className="text-[10px] text-muted">Absent</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Clock className="w-5 h-5 text-amberTxt mb-1.5" strokeWidth={2} />
                  <div className="text-base font-bold text-ink"><CountUp value={summary.lateToday} /></div>
                  <div className="text-[10px] text-muted">Late</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <CalendarClock className="w-5 h-5 text-orange-500 mb-1.5" strokeWidth={2} />
                  <div className="text-base font-bold text-ink"><CountUp value={summary.pendingLeaveCount} /></div>
                  <div className="text-[10px] text-muted">Leave pending</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <HelpCircle className="w-5 h-5 text-violet-500 mb-1.5" strokeWidth={2} />
                  <div className="text-base font-bold text-ink"><CountUp value={notYetRecorded} /></div>
                  <div className="text-[10px] text-muted">Not recorded</div>
                </div>
              </div>
            </div>
          )}

          {/* Compact Attendance Trend — percentages derived from the same
              attendanceTrend data the old full chart used, now used at every
              screen size. Today's % and the vs-last-7-days comparison only
              render when that derived data exists (2+ days of trend). */}
          {!loading && summary && pctTrendData.length > 0 && (
            <div className="bg-card border border-line rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-sm text-ink">Attendance Trend (Last 7 Days)</h2>
              </div>
              <CompactAttendanceTrendChart data={pctTrendData} />
              {todayPct !== null && (
                <div className="flex items-center border-t border-line mt-1 pt-3">
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold text-sky-500">{Math.round(todayPct)}%</div>
                    <div className="text-[11px] text-muted">Today</div>
                  </div>
                  {pctDelta !== null && (
                    <>
                      <div className="w-px h-8 bg-line" />
                      <div className="flex-1 text-center">
                        <div className={`text-lg font-bold flex items-center justify-center gap-1 ${pctDelta < 0 ? "text-roseTxt" : pctDelta > 0 ? "text-emeraldPri" : "text-muted"}`}>
                          {pctDelta < 0 ? <ArrowDown className="w-4 h-4" /> : pctDelta > 0 ? <ArrowUp className="w-4 h-4" /> : null}
                          {Math.abs(pctDelta).toFixed(1)}%
                        </div>
                        <div className="text-[11px] text-muted">vs last 7 days</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Today's attendance status split — real counts from /dashboard/summary,
              not a decorative gauge with a hardcoded percentage. Superseded by
              the "Needs Attention" card above; kept here only if you want the
              full breakdown bar back, otherwise safe to delete. */}
        </>
      )}

      {/* ─── SECTION 3: Live API Attendance & Leave Tables ───────────────────── */}

      {/* Recent Activity — Recent Attendance + Recent Leave combined into one
          tabbed card, reusing the exact same todayAttendance/recentLeave
          state, loading flags and per-section errors fetched above. */}
      <div className="bg-card border border-line rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <h2 className="font-bold text-sm text-ink">Recent Activity</h2>
          <Link
            href={canReview && activityTab === "attendance" ? "/attendance" : canReview ? "/leave/team" : "/leave"}
            className="text-xs text-accent hover:underline shrink-0"
          >
            View all →
          </Link>
        </div>
        <div className="px-4 pb-3 flex items-center gap-2">
          {/* Issue #16: EMPLOYEE has no /attendance/recent access at all
              (backend 403s), so there's nothing for this tab to show them --
              hide it rather than let them pick a tab that always fails. */}
          {canReview && (
            <button
              onClick={() => setActivityTab("attendance")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activityTab === "attendance" ? "bg-accent text-white" : "border border-line text-muted"
              }`}
            >
              Attendance
            </button>
          )}
          <button
            onClick={() => setActivityTab("leave")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activityTab === "leave" ? "bg-accent text-white" : "border border-line text-muted"
            }`}
          >
            Leave
          </button>
        </div>

        {canReview && activityTab === "attendance" ? (
          loading ? (
            <div>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : attendanceError ? (
            <ErrorState message={attendanceError} onRetry={fetchAttendance} />
          ) : todayAttendance.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck2 size={32} />}
              title="All Caught Up!"
              description="No attendance records have been logged yet today."
            />
          ) : (
            <ul>
              {todayAttendance.slice(0, 3).map((rec, i) => {
                const name = rec.employeeName ?? rec.employeeCode ?? "Employee";
                const time = rec.clockIn
                  ? new Date(rec.clockIn).toLocaleTimeString("en-IN", {
                      hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata",
                    })
                  : "—";
                return (
                  <li
                    key={rec.id ?? i}
                    className="flex items-center gap-3 px-4 py-3 border-t border-line hover:bg-canvas transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink truncate">{name}</div>
                      <div className="text-xs text-muted font-mono">
                        {time}
                        {rec.departmentName && <span className="font-sans"> · {rec.departmentName}</span>}
                      </div>
                    </div>
                    <StatusBadge status={rec.status ?? "PRESENT"} />
                  </li>
                );
              })}
            </ul>
          )
        ) : loading ? (
          <div>{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : leaveError ? (
          <ErrorState message={leaveError} onRetry={fetchLeave} />
        ) : recentLeave.length === 0 ? (
          <EmptyState
            icon={<CalendarOff size={32} />}
            title="No Leave Requests"
            description="Looks like everyone is geared up and ready for work!"
          />
        ) : (
          <ul>
            {recentLeave.slice(0, 3).map((req, i) => {
              const name = req.employeeName ?? "Me";
              const range = `${new Date(req.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${new Date(req.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
              return (
                <li
                  key={req.id ?? i}
                  className="flex items-center gap-3 px-4 py-3 border-t border-line hover:bg-canvas transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${avatarColor(name)} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                    {initials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{name}</div>
                    <div className="text-xs text-muted capitalize">{req.leaveType?.toLowerCase().replace("_", " ")} · {range}</div>
                  </div>
                  <StatusBadge status={req.status} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

    </div>
  );
}