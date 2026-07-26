"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AttendancePage as AttendancePageType } from "@/types/attendance";
import { ClockWidget } from "@/components/attendance/clock-widget";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const { role } = useAuth();
  const [page, setPage] = useState<AttendancePageType | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fixed 30-day window for now -- swap for a date-range picker later if needed.
  const from = isoDaysAgo(30);
  const to = todayIso();

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.get<AttendancePageType>("/attendance/me", {
          from,
          to,
          page: targetPage,
          size: PAGE_SIZE,
        });
        setPage(result);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Couldn't reach the server. Is the backend running on :8080?"
        );
      } finally {
        setLoading(false);
      }
    },
    [from, to]
  );

  useEffect(() => {
    load(pageIndex);
  }, [load, pageIndex]);

  const canManageOthers = role === "ADMIN" || role === "HR";

  return (
    <div className="flex flex-col gap-6">
      {/* Stacks on mobile, sits side-by-side from sm up */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Attendance</h1>
          <p className="text-sm text-muted">Last 30 days</p>
        </div>
        {canManageOthers && (
          <Link href="/attendance/team" className="sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              View team attendance
            </Button>
          </Link>
        )}
      </div>

      <ClockWidget onChange={() => load(pageIndex)} />

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      {loading && !page ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Loading attendance…
        </div>
      ) : page ? (
        <>
          <AttendanceTable records={page.content} />

          {page.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="secondary" disabled={page.first} onClick={() => setPageIndex((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {page.number + 1} of {page.totalPages}
              </span>
              <Button variant="secondary" disabled={page.last} onClick={() => setPageIndex((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}