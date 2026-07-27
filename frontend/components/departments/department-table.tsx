"use client";

import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";

interface Props {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

function HeadLabel({ name }: { name: string | null }) {
  if (!name) return <span className="italic">Unassigned</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-accent shrink-0"
        aria-hidden="true"
      >
        <path d="M12 2l2.9 6.3 6.9.7-5.2 4.7 1.6 6.8L12 17l-6.2 3.5 1.6-6.8L2.2 9l6.9-.7L12 2z" />
      </svg>
      {name}
    </span>
  );
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
    <>
      {/* Card layout below sm: every field gets its own labeled row, no
          horizontal scroll and nothing hidden. */}
      <div className="space-y-3 sm:hidden">
        {departments.map((dept) => (
          <div key={dept.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium text-ink">{dept.name}</div>
              <div className="font-mono text-xs text-muted">
                {dept.employeeCount} {dept.employeeCount === 1 ? "employee" : "employees"}
              </div>
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-muted">Head</dt>
                <dd className="text-ink">
                  <HeadLabel name={dept.headEmployeeName} />
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => onEdit(dept)}>
                Edit
              </Button>
              <Button variant="secondary" onClick={() => onDelete(dept)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Table layout at sm and up */}
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface sm:block">
        <table className="w-full min-w-[520px] text-sm">
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
                  <HeadLabel name={dept.headEmployeeName} />
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
    </>
  );
}