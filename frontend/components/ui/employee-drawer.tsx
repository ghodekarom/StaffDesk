"use client";

import React from "react";
import { useToast } from "@/components/ui/toast-notifications";

export interface EmployeeDrawerData {
  name: string;
  code: string;
  role: string;
  department: string;
  status: string;
  time?: string;
  email?: string;
}

interface EmployeeDrawerProps {
  data: EmployeeDrawerData | null;
  onClose: () => void;
}

export function EmployeeDrawer({ data, onClose }: EmployeeDrawerProps) {
  const { showToast } = useToast();

  if (!data) return null;

  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-[50] flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-[420px] max-w-full bg-surface h-full p-6 sm:p-7 shadow-2xl animate-[slideDrawer_0.25s_cubic-bezier(0.16,1,0.3,1)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="font-display font-bold text-base text-ink">
            Employee Profile Inspector
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink text-xl p-1 leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-line">
          <div className="w-12 h-12 rounded-xl bg-accent text-white font-semibold text-base flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="m-0 text-lg font-bold text-ink">{data.name}</h2>
            <div className="text-xs text-muted">{data.role}</div>
            <div className="font-mono text-xs text-accent font-semibold mt-0.5">
              {data.code}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Department
            </label>
            <div className="font-semibold text-sm text-ink mt-0.5">
              {data.department}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Work Email
            </label>
            <div className="font-mono text-xs text-ink mt-0.5">
              {data.email || `${data.name.toLowerCase().replace(" ", ".")}@staffdesk.io`}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Shift Status
            </label>
            <div className="font-semibold text-xs sm:text-sm text-emeraldTxt mt-0.5">
              {data.status} {data.time ? `(${data.time})` : ""}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              30-Day Attendance Rate
            </label>
            <div className="font-semibold text-xs sm:text-sm text-emeraldTxt mt-0.5">
              98.2% (22/22 Shifts)
            </div>
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-line">
          <button
            className="w-full h-10 bg-accent hover:bg-accentHover text-white font-semibold rounded-lg text-sm transition-colors"
            onClick={() => {
              showToast(`Direct message channel opened for ${data.name}`);
              onClose();
            }}
          >
            Send Direct Message
          </button>
        </div>
      </div>
    </div>
  );
}
