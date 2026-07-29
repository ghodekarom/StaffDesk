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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {departments.map((dept) => {
        const style = getBadgeStyles(dept.id);
        const employeeCountLabel = dept.employeeCount === 1 ? "1 employee" : `${dept.employeeCount} employees`;

        return (
          <div
            key={dept.id}
            className="group relative bg-card border border-line rounded-2xl p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-4"
          >
            {/* Badge Icon */}
            <div className={`w-12 h-12 shrink-0 rounded-xl ${style.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
              {renderIcon(dept.id)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-ink mb-0.5 truncate group-hover:text-accent transition-colors">
                {dept.name}
              </h3>
              <p className="text-xs text-muted font-medium mb-1 truncate">
                {employeeCountLabel}
              </p>
              <div className="text-[11px] text-muted truncate flex items-center gap-1">
                <span>Head:</span>
                <span className="font-semibold text-ink">
                  {dept.headEmployeeName ? dept.headEmployeeName : <span className="italic font-normal">Unassigned</span>}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 shrink-0">
              <Button
                variant="ghost"
                className="px-2 py-1 h-7 text-[10px] bg-canvas hover:bg-line/50 font-semibold"
                onClick={() => onEdit(dept)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="px-2 py-1 h-7 text-[10px] bg-roseBg text-roseTxt hover:bg-roseBg/80 font-semibold"
                onClick={() => onDelete(dept)}
              >
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}