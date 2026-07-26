import { LeaveStatus, LEAVE_STATUS_LABEL } from "@/types/leave";

const STATUS_STYLES: Record<LeaveStatus, string> = {
  PENDING: "bg-status-lateBg text-status-late",
  APPROVED: "bg-status-presentBg text-status-present",
  REJECTED: "bg-status-terminatedBg text-status-terminated",
};

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {LEAVE_STATUS_LABEL[status]}
    </span>
  );
}
