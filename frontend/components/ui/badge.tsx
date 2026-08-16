"use client";

import { EmployeeStatus } from "@/types/employee";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

const styles: Record<EmployeeStatus, string> = {
  ACTIVE: "text-status-active bg-status-activeBg",
  INACTIVE: "text-status-inactive bg-status-inactiveBg",
  TERMINATED: "text-status-terminated bg-status-terminatedBg",
};

const labels: Record<EmployeeStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  TERMINATED: "Terminated",
};

const dotStyles: Record<EmployeeStatus, string> = {
  ACTIVE: "bg-status-active",
  INACTIVE: "bg-status-inactive",
  TERMINATED: "bg-status-terminated",
};

export function StatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.16 }}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          styles[status]
        )}
      >
        <span className={clsx("h-1.5 w-1.5 rounded-full", dotStyles[status])} />
        {labels[status]}
      </motion.span>
    </AnimatePresence>
  );
}