import { AttendanceStatus, ATTENDANCE_STATUS_LABEL } from "@/types/attendance";

const STYLES: Record<AttendanceStatus, string> = {
  PRESENT: "bg-status-presentBg text-status-present",
  LATE: "bg-status-lateBg text-status-late",
  HALF_DAY: "bg-canvas text-muted border border-line",
  ABSENT: "bg-status-terminatedBg text-status-terminated",
};

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {ATTENDANCE_STATUS_LABEL[status]}
    </span>
  );
}