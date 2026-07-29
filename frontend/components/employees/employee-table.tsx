import { Employee } from "@/types/employee";
import { Avatar } from "./avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  onInspect,
}: {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onInspect?: (employee: Employee) => void;
}) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-card py-16 text-center shadow-sm">
        <p className="font-display text-base font-semibold text-ink">No employees found</p>
        <p className="text-xs sm:text-sm text-muted">Add your first employee to get started.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card List View (< 768px) */}
      <div className="mobile-card-list space-y-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => onInspect?.(emp)}
            className="mobile-data-card bg-card border border-line rounded-xl p-4 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:border-lineHover active:bg-canvas"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Avatar firstName={emp.firstName} lastName={emp.lastName} />
                <div>
                  <div className="font-semibold text-ink text-sm">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-xs text-muted">
                    {emp.departmentName || "General"}
                  </div>
                </div>
              </div>
              <StatusBadge status={emp.status} />
            </div>

            <div className="flex items-center justify-between text-xs text-muted border-t border-line pt-2.5">
              <span>Code: <strong className="font-mono text-accent">{emp.employeeCode}</strong></span>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onEdit(emp)}>
                  Edit
                </Button>
                <Button variant="ghost" className="px-2 py-1 text-xs text-roseTxt" onClick={() => onDelete(emp)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="desktop-table-wrapper bg-card border border-line rounded-xl shadow-sm overflow-hidden">
        <table className="data-table w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">
                Employee
              </th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">
                Code
              </th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">
                Department
              </th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">
                Manager
              </th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">
                Status
              </th>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => onInspect?.(emp)}
                className="row-clickable hover:bg-canvas cursor-pointer transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={emp.firstName} lastName={emp.lastName} />
                    <div>
                      <div className="font-semibold text-ink">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-xs text-muted">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-accent">
                  {emp.employeeCode}
                </td>
                <td className="px-5 py-3.5 text-muted">{emp.departmentName ?? "—"}</td>
                <td className="px-5 py-3.5 text-muted">{emp.managerName ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={emp.status} />
                </td>
                <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => onEdit(emp)}>
                      Edit
                    </Button>
                    <Button variant="ghost" className="px-2.5 py-1 text-xs text-roseTxt hover:bg-roseBg" onClick={() => onDelete(emp)}>
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