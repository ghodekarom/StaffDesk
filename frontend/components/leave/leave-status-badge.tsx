"use client";

import { LeaveStatus, LEAVE_STATUS_LABEL } from "@/types/leave";
import { AnimatePresence, motion } from "framer-motion";

const STATUS_STYLES: Record<LeaveStatus, string> = {
  PENDING: "bg-status-lateBg text-status-late",
  APPROVED: "bg-status-presentBg text-status-present",
  REJECTED: "bg-status-terminatedBg text-status-terminated",
};

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.16 }}
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
      >
        {LEAVE_STATUS_LABEL[status]}
      </motion.span>
    </AnimatePresence>
  );
}