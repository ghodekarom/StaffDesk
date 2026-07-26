"use client";

import { LeaveRequestRecord, LEAVE_TYPE_LABEL } from "@/types/leave";
import { LeaveStatusBadge } from "@/components/leave/leave-status-badge";
import { Button } from "@/components/ui/button";

interface Props {
  requests: LeaveRequestRecord[];
  // Shown for the HR/Manager "all requests" view; omit for the self-service view.
  showEmployeeColumn?: boolean;
  // Self-service: lets an employee cancel their own pending request.
  onCancel?: (request: LeaveRequestRecord) => void;
  // HR/Manager: approve or reject a pending request.
  onApprove?: (request: LeaveRequestRecord) => void;
  onReject?: (request: LeaveRequestRecord) => void;
}

export function LeaveRequestTable({
  requests,
  showEmployeeColumn = false,
  onCancel,
  onApprove,
  onReject,
}: Props) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
        No leave requests yet.
      </div>
    );
  }

  const showActions = Boolean(onCancel || onApprove || onReject);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
            {showEmployeeColumn && <th className="px-4 py-3 font-medium">Employee</th>}
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Dates</th>
            <th className="px-4 py-3 font-medium">Days</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Approver</th>
            {showActions && <th className="px-4 py-3 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
              {showEmployeeColumn && (
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{req.employeeName}</div>
                  <div className="font-mono text-xs text-muted">{req.employeeCode}</div>
                </td>
              )}
              <td className="px-4 py-3 text-ink">{LEAVE_TYPE_LABEL[req.leaveType]}</td>
              <td className="px-4 py-3 text-muted">
                {req.startDate === req.endDate ? req.startDate : `${req.startDate} → ${req.endDate}`}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted">{req.days}</td>
              <td className="px-4 py-3">
                <LeaveStatusBadge status={req.status} />
              </td>
              <td className="px-4 py-3 text-muted">{req.approvedByName ?? "—"}</td>
              {showActions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {req.status === "PENDING" && onApprove && (
                      <Button variant="secondary" onClick={() => onApprove(req)}>
                        Approve
                      </Button>
                    )}
                    {req.status === "PENDING" && onReject && (
                      <Button variant="secondary" onClick={() => onReject(req)}>
                        Reject
                      </Button>
                    )}
                    {req.status === "PENDING" && onCancel && (
                      <Button variant="secondary" onClick={() => onCancel(req)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
