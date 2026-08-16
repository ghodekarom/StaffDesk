"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { AttendancePage, AttendanceRecord } from "@/types/attendance";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const PULSE_DURATION = 1400;

export function ClockWidget({ onChange }: { onChange?: () => void }) {
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  // Brief "just completed" flag drives the success pulse ring + checkmark
  // swap right after a clock-in/out succeeds, then clears itself.
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setLiveTime(new Date().toLocaleTimeString("en-GB"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const date = todayIso();
      const page = await api.get<AttendancePage>("/attendance/me", { from: date, to: date, size: 1 });
      setToday(page.content[0] ?? null);
    } catch {
      setToday(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  function flashSuccess() {
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), PULSE_DURATION);
  }

  async function handleClockIn() {
    setActionError(null);
    setSubmitting(true);
    try {
      const record = await api.post<AttendanceRecord>("/attendance/clock-in");
      setToday(record);
      flashSuccess();
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
      flashSuccess();
      onChange?.();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to clock out.");
    } finally {
      setSubmitting(false);
    }
  }

  const clockedIn = today?.clockIn != null;
  const clockedOut = today?.clockOut != null;

  const formatDateString = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const statusDetail = clockedOut
    ? `Shift completed (Out: ${formatTime(today?.clockOut ?? null)})`
    : clockedIn
    ? `Clocked in at ${formatTime(today?.clockIn ?? null)}`
    : "Not clocked in yet today";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-lg border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 transition-shadow duration-300 ${
        justCompleted ? "animate-pulse-ring" : ""
      }`}
    >
      {/* Background radial highlight */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
          {liveTime || "00:00:00"}
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-xs sm:text-sm text-slate-300 font-medium">
          {formatDateString()} &middot; <span className={clockedIn && !clockedOut ? "text-emerald-400 font-semibold" : "text-slate-300"}>{statusDetail}</span>
        </div>
        {actionError && (
          <p className="mt-1 text-xs text-rose-400 font-semibold bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-md self-start">
            {actionError}
          </p>
        )}
      </div>

      <div className="relative z-10 flex items-center">
        {loading ? (
          <span className="text-xs text-slate-400 font-medium animate-pulse">Loading status…</span>
        ) : clockedOut ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400">
            Done for today
          </span>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {justCompleted ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18 }}
                className="inline-flex min-w-[104px] items-center justify-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-5 py-2 text-xs sm:text-sm font-semibold text-emerald-300"
              >
                <Check size={14} />
                {clockedIn ? "Clocked out" : "Clocked in"}
              </motion.span>
            ) : clockedIn ? (
              <motion.div key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  onClick={handleClockOut}
                  loading={submitting}
                  loadingText="Clocking out…"
                  className="min-w-[104px] bg-white/15 hover:bg-white/25 text-white border border-white/20 px-5 py-2 font-semibold text-xs sm:text-sm rounded-lg transition-colors"
                >
                  Clock Out
                </Button>
              </motion.div>
            ) : (
              <motion.div key="in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  onClick={handleClockIn}
                  loading={submitting}
                  loadingText="Clocking in…"
                  className="min-w-[104px] bg-white/15 hover:bg-white/25 text-white border border-white/20 px-5 py-2 font-semibold text-xs sm:text-sm rounded-lg transition-colors"
                >
                  Clock In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}