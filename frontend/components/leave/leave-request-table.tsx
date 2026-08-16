"use client";

import { LeaveRequestRecord, LEAVE_TYPE_LABEL } from "@/types/leave";
import { LeaveStatusBadge } from "@/components/leave/leave-status-badge";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

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

function formatDates(req: LeaveRequestRecord): string {
  return req.startDate === req.endDate ? req.startDate : `${req.startDate} → ${req.endDate}`;
}

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

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
    <>
      {/* Card layout below sm: every field gets its own labeled row, no
          horizontal scroll and nothing hidden. */}
      <motion.div
        className="space-y-3 sm:hidden"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      >
        <AnimatePresence mode="popLayout">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              layout
              variants={rowVariants}
              exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.18 } }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  {showEmployeeColumn && (
                    <>
                      <div className="font-medium text-ink">{req.employeeName}</div>
                      <div className="font-mono text-xs text-muted">{req.employeeCode}</div>
                    </>
                  )}
                  <div className={showEmployeeColumn ? "mt-1.5 text-sm text-ink" : "font-medium text-ink"}>
                    {LEAVE_TYPE_LABEL[req.leaveType]}
                  </div>
                </div>
                <LeaveStatusBadge status={req.status} />
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-xs uppercase tracking-wide text-muted">Dates</dt>
                  <dd className="text-right text-ink">{formatDates(req)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-xs uppercase tracking-wide text-muted">Days</dt>
                  <dd className="font-mono text-xs text-ink">{req.days}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-xs uppercase tracking-wide text-muted">Approver</dt>
                  <dd className="text-right text-ink">{req.approvedByName ?? "—"}</dd>
                </div>
              </dl>
              {showActions && req.status === "PENDING" && (
                <div className="mt-4 flex justify-end gap-2">
                  {onApprove && (
                    <Button variant="secondary" onClick={() => onApprove(req)}>
                      Approve
                    </Button>
                  )}
                  {onReject && (
                    <Button variant="secondary" onClick={() => onReject(req)}>
                      Reject
                    </Button>
                  )}
                  {onCancel && (
                    <Button variant="secondary" onClick={() => onCancel(req)}>
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Table layout at sm and up */}
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface sm:block">
        <table className="w-full min-w-[640px] text-sm">
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
          <motion.tbody
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence mode="popLayout">
              {requests.map((req) => (
                <motion.tr
                  key={req.id}
                  layout
                  variants={rowVariants}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-line last:border-0 hover:bg-canvas/60"
                >
                  {showEmployeeColumn && (
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{req.employeeName}</div>
                      <div className="font-mono text-xs text-muted">{req.employeeCode}</div>
                    </td>
                  )}
                  <td className="px-4 py-3 text-ink">{LEAVE_TYPE_LABEL[req.leaveType]}</td>
                  <td className="px-4 py-3 text-muted">{formatDates(req)}</td>
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
                </motion.tr>
              ))}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </>
  );
}