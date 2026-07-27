import { AttendanceRecord } from "@/types/attendance";
import { AttendanceStatusBadge } from "./attendance-status-badge";
import { Button } from "@/components/ui/button";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  records: AttendanceRecord[];
  showEmployee?: boolean;
  onEdit?: (record: AttendanceRecord) => void;
}

export function AttendanceTable({ records, showEmployee = false, onEdit }: Props) {
  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
        No attendance records in this range.
      </div>
    );
  }

  return (
    <>
      {/* Card layout below sm: every field gets its own labeled row, no
          horizontal scroll and nothing hidden. */}
      <div className="space-y-3 sm:hidden">
        {records.map((record) => (
          <div key={record.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-ink">{formatDate(record.attendanceDate)}</div>
                {showEmployee && (
                  <div className="mt-0.5">
                    <div className="text-sm text-ink">{record.employeeName}</div>
                    <div className="font-mono text-xs text-muted">{record.employeeCode}</div>
                  </div>
                )}
              </div>
              <AttendanceStatusBadge status={record.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-xs uppercase tracking-wide text-muted">Clock in</dt>
              <dd className="text-right text-ink">{formatTime(record.clockIn)}</dd>
              <dt className="text-xs uppercase tracking-wide text-muted">Clock out</dt>
              <dd className="text-right text-ink">{formatTime(record.clockOut)}</dd>
            </dl>
            {onEdit && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" className="px-2 py-1" onClick={() => onEdit(record)}>
                  Edit
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table layout at sm and up */}
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface sm:block">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              {showEmployee && <th className="px-4 py-3 font-medium">Employee</th>}
              <th className="px-4 py-3 font-medium">Clock in</th>
              <th className="px-4 py-3 font-medium">Clock out</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {onEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-canvas/60">
                <td className="px-4 py-3 text-ink">{formatDate(record.attendanceDate)}</td>
                {showEmployee && (
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{record.employeeName}</div>
                    <div className="font-mono text-xs text-muted">{record.employeeCode}</div>
                  </td>
                )}
                <td className="px-4 py-3 text-muted">{formatTime(record.clockIn)}</td>
                <td className="px-4 py-3 text-muted">{formatTime(record.clockOut)}</td>
                <td className="px-4 py-3">
                  <AttendanceStatusBadge status={record.status} />
                </td>
                {onEdit && (
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" className="px-2 py-1" onClick={() => onEdit(record)}>
                      Edit
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}