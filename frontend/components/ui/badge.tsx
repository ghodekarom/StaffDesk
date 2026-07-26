import { EmployeeStatus } from "@/types/employee";
import clsx from "clsx";

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
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", dotStyles[status])} />
      {labels[status]}
    </span>
  );
}
