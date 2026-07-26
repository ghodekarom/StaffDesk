"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { AttendancePage, AttendanceRecord } from "@/types/attendance";
import { Button } from "@/components/ui/button";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ClockWidget({ onChange }: { onChange?: () => void }) {
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const date = todayIso();
      // /attendance/me is a general history endpoint -- narrowing from/to to
      // today is the simplest way to get "is there a record for today yet".
      const page = await api.get<AttendancePage>("/attendance/me", { from: date, to: date, size: 1 });
      setToday(page.content[0] ?? null);
    } catch {
      // Non-fatal: widget just falls back to the "not clocked in" state.
      setToday(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  async function handleClockIn() {
    setActionError(null);
    setSubmitting(true);
    try {
      const record = await api.post<AttendanceRecord>("/attendance/clock-in");
      setToday(record);
      onChange?.();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to clock in.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClockOut() {
    setActionError(null);
    setSubmitting(true);
    try {
      const record = await api.post<AttendanceRecord>("/attendance/clock-out");
      setToday(record);
      onChange?.();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to clock out.");
    } finally {
      setSubmitting(false);
    }
  }

  const clockedIn = today?.clockIn != null;
  const clockedOut = today?.clockOut != null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-surface p-5">
      <div>
        <p className="text-sm font-medium text-ink">Today</p>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <p className="text-sm text-muted">
            In: <span className="text-ink">{formatTime(today?.clockIn ?? null)}</span>
            {"   ·   "}
            Out: <span className="text-ink">{formatTime(today?.clockOut ?? null)}</span>
          </p>
        )}
        {actionError && <p className="mt-1 text-sm text-status-terminated">{actionError}</p>}
      </div>

      {!loading &&
        (clockedOut ? (
          <span className="text-sm text-muted">Done for today</span>
        ) : clockedIn ? (
          <Button onClick={handleClockOut} disabled={submitting}>
            {submitting ? "Clocking out…" : "Clock out"}
          </Button>
        ) : (
          <Button onClick={handleClockIn} disabled={submitting}>
            {submitting ? "Clocking in…" : "Clock in"}
          </Button>
        ))}
    </div>
  );
}
