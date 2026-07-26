"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceUpsertRequest,
  ATTENDANCE_STATUS_LABEL,
} from "@/types/attendance";

// datetime-local inputs have no timezone; treated as local time and
// converted to/from a UTC ISO instant at the form boundary.
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

const STATUS_OPTIONS: AttendanceStatus[] = ["PRESENT", "ABSENT", "HALF_DAY", "LATE"];

interface Props {
  employeeName: string;
  date: string; // ISO date the record belongs to (fixed by the caller)
  initial?: AttendanceRecord;
  onSubmit: (data: AttendanceUpsertRequest) => Promise<void>;
  onCancel: () => void;
}

export function AttendanceOverrideForm({ employeeName, date, initial, onSubmit, onCancel }: Props) {
  const [clockIn, setClockIn] = useState(toDatetimeLocal(initial?.clockIn ?? null));
  const [clockOut, setClockOut] = useState(toDatetimeLocal(initial?.clockOut ?? null));
  const [status, setStatus] = useState<AttendanceStatus>(initial?.status ?? "PRESENT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        clockIn: fromDatetimeLocal(clockIn),
        clockOut: fromDatetimeLocal(clockOut),
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        {employeeName} · {date}
      </p>

      {error && (
        <div className="rounded-md bg-status-terminatedBg px-3 py-2 text-sm text-status-terminated">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="attendance-clock-in" className="text-sm font-medium text-ink">
            Clock in
          </label>
          <input
            id="attendance-clock-in"
            type="datetime-local"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="attendance-clock-out" className="text-sm font-medium text-ink">
            Clock out
          </label>
          <input
            id="attendance-clock-out"
            type="datetime-local"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="attendance-status" className="text-sm font-medium text-ink">
          Status
        </label>
        <select
          id="attendance-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {ATTENDANCE_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
