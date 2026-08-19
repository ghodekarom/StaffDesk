import { Employee } from "@/types/employee";
import { Avatar } from "./avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Shimmering skeleton row for loading state
export function EmployeeTableSkeleton() {
  return (
    <div className="bg-card border border-line rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {["Employee", "Code", "Department", "Manager", "Status", ""].map((h) => (
              <th key={h} className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full skeleton-shimmer shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded skeleton-shimmer" />
                    <div className="h-2 w-20 rounded skeleton-shimmer" />
                  </div>
                </div>
              </td>
              <td className="px-5 py-4"><div className="h-3 w-16 rounded skeleton-shimmer" /></td>
              <td className="px-5 py-4"><div className="h-3 w-20 rounded skeleton-shimmer" /></td>
              <td className="px-5 py-4"><div className="h-3 w-20 rounded skeleton-shimmer" /></td>
              <td className="px-5 py-4"><div className="h-5 w-14 rounded-full skeleton-shimmer" /></td>
              <td className="px-5 py-4"><div className="h-3 w-12 rounded skeleton-shimmer ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Small "No login" indicator for employees with an HR record but no
// matching `users` row yet. See employee-login-gap-issue.md.
function NoLoginBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-status-terminatedBg px-2.5 py-0.5 text-xs font-medium text-status-terminated">
      <span className="h-1.5 w-1.5 rounded-full bg-status-terminated" />
      No login
    </span>
  );
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  onInspect,
  onCreateLogin,
  canCreateLogin = false,
}: {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onInspect?: (employee: Employee) => void;
  // ADMIN-only "Create login" action -- omit both props (or leave
  // canCreateLogin false) to hide it for non-ADMIN viewers, since they
  // can't call POST /auth/register anyway.
  onCreateLogin?: (employee: Employee) => void;
  canCreateLogin?: boolean;
}) {
  if (employees.length === 0) {
    return (
      <EmptyState
        icon={<Users size={36} />}
        title="No employees found"
        description="Add your first employee to get started, or clear your search filters."
      />
    );
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* Mobile Card List View */}
      <div className="mobile-card-list space-y-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            onClick={() => onInspect?.(emp)}
            className="mobile-data-card bg-card border border-line rounded-xl p-4 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:border-lineHover active:bg-canvas transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Avatar firstName={emp.firstName} lastName={emp.lastName} status={emp.status} />
                <div>
                  <div className="font-semibold text-ink text-sm">{emp.firstName} {emp.lastName}</div>
                  <div className="text-xs text-muted">{emp.departmentName || "General"}</div>
                </div>
              </div>
              <div className="flex flex-nowrap items-center gap-1.5">
                {!emp.hasLoginAccount && <NoLoginBadge />}
                <StatusBadge status={emp.status} />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted border-t border-line pt-2.5">
              <span>Code: <strong className="font-mono text-accent">{emp.employeeCode}</strong></span>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {canCreateLogin && !emp.hasLoginAccount && onCreateLogin && (
                  <Button variant="ghost" className="px-2 py-1 text-xs text-accent" onClick={() => onCreateLogin(emp)}>
                    Create login
                  </Button>
                )}
                <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onEdit(emp)}>Edit</Button>
                <Button variant="ghost" className="px-2 py-1 text-xs text-roseTxt" onClick={() => onDelete(emp)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) with sticky header + hover action bar */}
      <div className="desktop-table-wrapper bg-card border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">Employee</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">Code</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">Department</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line">Manager</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line min-w-[190px]">Status</th>
                <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-muted bg-canvas border-b border-line text-right min-w-[260px]">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-line text-sm"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            >
              <AnimatePresence mode="popLayout">
                {employees.map((emp) => (
                  <motion.tr
                    key={emp.id}
                    layout
                    variants={rowVariants}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onInspect?.(emp)}
                    className="group row-clickable hover:bg-canvas cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={emp.firstName} lastName={emp.lastName} status={emp.status} />
                        <div>
                          <div className="font-semibold text-ink">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-muted">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-accent">{emp.employeeCode}</td>
                    <td className="px-5 py-3.5 text-muted">{emp.departmentName ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted">{emp.managerName ?? "—"}</td>
                    <td className="px-5 py-3.5 min-w-[190px]">
                      <div className="flex flex-nowrap items-center gap-1.5">
                        {!emp.hasLoginAccount && <NoLoginBadge />}
                        <StatusBadge status={emp.status} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right min-w-[260px]" onClick={(e) => e.stopPropagation()}>
                      {/* Hover-reveal floating action bar */}
                      <div className="row-actions flex flex-nowrap justify-end gap-1.5">
                        {canCreateLogin && !emp.hasLoginAccount && onCreateLogin && (
                          <button
                            className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
                            onClick={() => onCreateLogin(emp)}
                          >
                            Create login
                          </button>
                        )}
                        <button
                          className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-line text-ink hover:bg-canvas transition-colors"
                          onClick={() => onEdit(emp)}
                        >
                          Edit
                        </button>
                        <button
                          className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium bg-roseBg border border-rosePri/20 text-roseTxt hover:bg-rosePri/10 transition-colors"
                          onClick={() => onDelete(emp)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>
    </>
  );
}