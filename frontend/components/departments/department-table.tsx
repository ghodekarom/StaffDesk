"use client";

import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";

interface Props {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

const getBadgeStyles = (id: number) => {
  const styles = [
    { bg: "bg-emeraldBg text-emeraldTxt" },
    { bg: "bg-sky-500/10 text-sky-500" },
    { bg: "bg-amberBg text-amberTxt" },
    { bg: "bg-indigo-500/10 text-indigo-500" },
    { bg: "bg-roseBg text-roseTxt" },
  ];
  return styles[id % styles.length];
};

function renderIcon(id: number) {
  const icons = [
    <svg key="0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21V9l9-6 9 6v12"/></svg>,
    <svg key="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
    <svg key="2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>,
    <svg key="3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12h14"/></svg>,
    <svg key="4" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  ];
  return icons[id % icons.length];
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments.map((dept) => {
        const style = getBadgeStyles(dept.id);
        const employeeCountLabel = dept.employeeCount === 1 ? "1 employee" : `${dept.employeeCount} employees`;

        return (
          <div
            key={dept.id}
            className="group relative bg-card border border-line rounded-xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Badge Icon */}
              <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                {renderIcon(dept.id)}
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-ink mb-1 group-hover:text-accent transition-colors">
                {dept.name}
              </h3>
              
              {/* Headcount */}
              <p className="text-xs text-muted font-medium mb-4">
                {employeeCountLabel}
              </p>
            </div>

            {/* Department Head and Action Buttons */}
            <div className="mt-4 pt-3 border-t border-line">
              <div className="flex justify-between items-center text-xs mb-4">
                <span className="text-muted font-medium">Head</span>
                <span className="font-semibold text-ink">
                  {dept.headEmployeeName ? (
                    <span className="inline-flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent shrink-0">
                        <path d="M12 2l2.9 6.3 6.9.7-5.2 4.7 1.6 6.8L12 17l-6.2 3.5 1.6-6.8L2.2 9l6.9-.7L12 2z" />
                      </svg>
                      {dept.headEmployeeName}
                    </span>
                  ) : (
                    <span className="italic text-muted font-normal">Unassigned</span>
                  )}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  className="px-2.5 py-1 text-xs hover:bg-canvas"
                  onClick={() => onEdit(dept)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="px-2.5 py-1 text-xs text-roseTxt hover:bg-roseBg"
                  onClick={() => onDelete(dept)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}