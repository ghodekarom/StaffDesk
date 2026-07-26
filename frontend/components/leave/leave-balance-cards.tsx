import { LeaveBalance, LEAVE_TYPE_LABEL } from "@/types/leave";

export function LeaveBalanceCards({ balances }: { balances: LeaveBalance[] }) {
  if (balances.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {balances.map((balance) => (
        <div key={balance.id} className="rounded-lg border border-line bg-surface px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-muted">
            {LEAVE_TYPE_LABEL[balance.leaveType]}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-2xl font-semibold text-ink">{balance.remaining}</span>
            <span className="text-sm text-muted">/ {balance.total} days left</span>
          </div>
          <div className="mt-1 text-xs text-muted">{balance.used} used this year</div>
        </div>
      ))}
    </div>
  );
}
