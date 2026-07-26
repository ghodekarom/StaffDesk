import { AttendanceStatus, ATTENDANCE_STATUS_LABEL } from "@/types/attendance";

// Reuses only tokens already confirmed in use elsewhere (accent/status-terminated
// pairs) rather than inventing new design-system colors for LATE/HALF_DAY.
const STYLES: Record<AttendanceStatus, string> = {
  PRESENT: "bg-accentTint text-accentInk",
  LATE: "bg-status-terminatedBg text-status-terminated",
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
