"use client";

import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";

interface Props {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export function DepartmentTable({ departments, onEdit, onDelete }: Props) {
  if (departments.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
        No departments yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Head</th>
            <th className="px-4 py-3 font-medium">Employees</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
              <td className="px-4 py-3 font-medium text-ink">{dept.name}</td>
              <td className="px-4 py-3 text-muted">
                {dept.headEmployeeName ? (
                  <span className="inline-flex items-center gap-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-accent"
                      aria-hidden="true"
                    >
                      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.7 1.6 6.8L12 17l-6.2 3.5 1.6-6.8L2.2 9l6.9-.7L12 2z" />
                    </svg>
                    {dept.headEmployeeName}
                  </span>
                ) : (
                  <span className="italic">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted">{dept.employeeCount}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => onEdit(dept)}>
                    Edit
                  </Button>
                  <Button variant="secondary" onClick={() => onDelete(dept)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
