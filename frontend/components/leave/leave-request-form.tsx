"use client";

import { useState, FormEvent } from "react";
import { LeaveRequestCreateRequest, LeaveType, LEAVE_TYPE_LABEL } from "@/types/leave";
import { Button } from "@/components/ui/button";

interface Props {
  onSubmit: (data: LeaveRequestCreateRequest) => Promise<void>;
  onCancel: () => void;
}

const LEAVE_TYPES: LeaveType[] = ["SICK", "CASUAL", "EARNED"];

export function LeaveRequestForm({ onSubmit, onCancel }: Props) {
  const [leaveType, setLeaveType] = useState<LeaveType>("CASUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md bg-status-terminatedBg px-3 py-2 text-sm text-status-terminated">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="leave-type" className="text-sm font-medium text-ink">
          Leave type
        </label>
        <select
          id="leave-type"
          required
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value as LeaveType)}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        >
          {LEAVE_TYPES.map((type) => (
            <option key={type} value={type}>
              {LEAVE_TYPE_LABEL[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="start-date" className="text-sm font-medium text-ink">
            Start date
          </label>
          <input
            id="start-date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="end-date" className="text-sm font-medium text-ink">
            End date
          </label>
          <input
            id="end-date"
            type="date"
            required
            min={startDate || undefined}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="reason" className="text-sm font-medium text-ink">
          Reason (optional)
        </label>
        <textarea
          id="reason"
          rows={3}
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}
