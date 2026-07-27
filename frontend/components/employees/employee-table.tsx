import { Employee } from "@/types/employee";
import { Avatar } from "./avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
}: {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line bg-surface py-16 text-center">
        <p className="font-display text-base font-semibold text-ink">No employees yet</p>
        <p className="text-sm text-muted">Add your first employee to get started.</p>
      </div>
    );
  }

  return (
    <>
      {/* Card layout below sm: every field gets its own labeled row, no
          horizontal scroll and nothing hidden. */}
      <div className="space-y-3 sm:hidden">
        {employees.map((emp) => (
          <div key={emp.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar firstName={emp.firstName} lastName={emp.lastName} />
                <div>
                  <div className="font-medium text-ink">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-xs text-muted">{emp.email}</div>
                  <div className="font-mono text-[11px] text-muted">{emp.employeeCode}</div>
                </div>
              </div>
              <StatusBadge status={emp.status} />
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-muted">Department</dt>
                <dd className="text-right text-ink">{emp.departmentName ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-muted">Manager</dt>
                <dd className="text-right text-ink">{emp.managerName ?? "—"}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" className="px-2 py-1" onClick={() => onEdit(emp)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                className="px-2 py-1 text-status-terminated hover:bg-status-terminatedBg"
                onClick={() => onDelete(emp)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Table layout at sm and up */}
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Manager</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-canvas/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={emp.firstName} lastName={emp.lastName} />
                    <div>
                      <div className="font-medium text-ink">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-xs text-muted">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{emp.employeeCode}</td>
                <td className="px-4 py-3 text-muted">{emp.departmentName ?? "—"}</td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{emp.managerName ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={emp.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="px-2 py-1" onClick={() => onEdit(emp)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2 py-1 text-status-terminated hover:bg-status-terminatedBg"
                      onClick={() => onDelete(emp)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}