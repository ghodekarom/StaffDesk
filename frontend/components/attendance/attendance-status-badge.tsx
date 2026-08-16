"use client";

import { AttendanceStatus, ATTENDANCE_STATUS_LABEL } from "@/types/attendance";
import { AnimatePresence, motion } from "framer-motion";

const STYLES: Record<AttendanceStatus, string> = {
  PRESENT: "bg-status-presentBg text-status-present",
  LATE: "bg-status-lateBg text-status-late",
  HALF_DAY: "bg-canvas text-muted border border-line",
  ABSENT: "bg-status-terminatedBg text-status-terminated",
};

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.16 }}
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
      >
        {ATTENDANCE_STATUS_LABEL[status]}
      </motion.span>
    </AnimatePresence>
  );
}