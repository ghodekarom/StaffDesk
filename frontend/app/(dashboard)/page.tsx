"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast-notifications";
import { EmployeeDrawer, EmployeeDrawerData } from "@/components/ui/employee-drawer";

export default function DashboardOverviewPage() {
  const { showToast } = useToast();
  const [inspectEmployee, setInspectEmployee] = useState<EmployeeDrawerData | null>(null);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Good morning, Aisha
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Operations summary for today, July 29, 2026.
          </p>
        </div>
        <button
          onClick={() => showToast("Exporting Daily Summary PDF...")}
          className="self-start sm:self-auto bg-surface hover:bg-canvas border border-line text-ink px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          Export Report
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-line rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              Total Employees
            </div>
            <div className="font-display text-2xl font-bold text-ink mt-1">
              128
            </div>
            <div className="text-xs text-emeraldTxt font-medium mt-1">
              ↑ +4 this month
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emeraldBg text-emeraldTxt flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            </svg>
          </div>
        </div>

        <div className="bg-card border border-line rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              Clocked In Now
            </div>
            <div className="font-display text-2xl font-bold text-ink mt-1">
              97
            </div>
            <div className="text-xs text-muted mt-1">75.8% of total staff</div>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg viewBox="0 0 50 50" className="w-full h-full -rotate-90">
              <circle className="stroke-line" cx="25" cy="25" r="20" fill="none" strokeWidth="4.5" />
              <circle
                className="stroke-emeraldPri"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4.5"
                strokeDasharray="126"
                strokeDashoffset="30"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-ink">76%</span>
          </div>
        </div>

        <div className="bg-card border border-line rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              Departments
            </div>
            <div className="font-display text-2xl font-bold text-ink mt-1">6</div>
            <div className="text-xs text-muted mt-1">All 6 operational</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-accent flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21V9l9-6 9 6v12" />
            </svg>
          </div>
        </div>

        <div className="bg-card border border-line rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              Pending Leave
            </div>
            <div className="font-display text-2xl font-bold text-ink mt-1">2</div>
            <div className="text-xs text-amberTxt font-medium mt-1">
              Requires approval
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amberBg text-amberTxt flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="16" height="10" rx="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Attendance Activity Card */}
      <div className="bg-card border border-line rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-surface">
          <h3 className="font-semibold text-sm sm:text-base text-ink">
            Recent Attendance Activity
          </h3>
          <Link
            href="/attendance"
            className="bg-surface hover:bg-canvas border border-line text-ink px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            View Log
          </Link>
        </div>

        {/* Desktop View */}
        <div className="desktop-table-wrapper">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-line text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Clock In</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-xs sm:text-sm">
              <tr
                className="hover:bg-canvas cursor-pointer transition-colors"
                onClick={() =>
                  setInspectEmployee({
                    name: "Aisha Rahman",
                    code: "EMP-0104",
                    role: "HR Administrator",
                    department: "People Ops",
                    status: "Present",
                    time: "09:02 AM",
                    email: "aisha.rahman@staffdesk.io",
                  })
                }
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent text-white font-semibold text-xs flex items-center justify-center">
                      AR
                    </div>
                    <div>
                      <div className="font-semibold text-ink">Aisha Rahman</div>
                      <div className="text-[11.5px] text-muted">HR Administrator</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">People Ops</td>
                <td className="px-5 py-3.5 font-mono">09:02 AM</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emeraldBg text-emeraldTxt border border-emeraldPri/20">
                    ● Present
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="bg-surface border border-line px-2.5 py-1 rounded-md text-xs font-medium hover:bg-canvas">
                    Inspect
                  </button>
                </td>
              </tr>

              <tr
                className="hover:bg-canvas cursor-pointer transition-colors"
                onClick={() =>
                  setInspectEmployee({
                    name: "Daniel Kim",
                    code: "EMP-0089",
                    role: "Backend Engineer",
                    department: "Engineering",
                    status: "Present",
                    time: "08:47 AM",
                    email: "daniel.kim@staffdesk.io",
                  })
                }
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                      DK
                    </div>
                    <div>
                      <div className="font-semibold text-ink">Daniel Kim</div>
                      <div className="text-[11.5px] text-muted">Backend Engineer</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">Engineering</td>
                <td className="px-5 py-3.5 font-mono">08:47 AM</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emeraldBg text-emeraldTxt border border-emeraldPri/20">
                    ● Present
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="bg-surface border border-line px-2.5 py-1 rounded-md text-xs font-medium hover:bg-canvas">
                    Inspect
                  </button>
                </td>
              </tr>

              <tr
                className="hover:bg-canvas cursor-pointer transition-colors"
                onClick={() =>
                  setInspectEmployee({
                    name: "Priya Sharma",
                    code: "EMP-0033",
                    role: "Financial Analyst",
                    department: "Finance",
                    status: "Late",
                    time: "09:22 AM",
                    email: "priya.sharma@staffdesk.io",
                  })
                }
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-semibold text-xs flex items-center justify-center">
                      PS
                    </div>
                    <div>
                      <div className="font-semibold text-ink">Priya Sharma</div>
                      <div className="text-[11.5px] text-muted">Financial Analyst</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">Finance</td>
                <td className="px-5 py-3.5 font-mono">09:22 AM</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amberBg text-amberTxt border border-amberPri/20">
                    ⚠️ Late
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="bg-surface border border-line px-2.5 py-1 rounded-md text-xs font-medium hover:bg-canvas">
                    Inspect
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="mobile-card-list">
          <div
            className="bg-card border border-line rounded-xl p-4 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:border-lineHover"
            onClick={() =>
              setInspectEmployee({
                name: "Aisha Rahman",
                code: "EMP-0104",
                role: "HR Administrator",
                department: "People Ops",
                status: "Present",
                time: "09:02 AM",
              })
            }
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent text-white font-semibold text-xs flex items-center justify-center">
                  AR
                </div>
                <div>
                  <div className="font-semibold text-ink">Aisha Rahman</div>
                  <div className="text-xs text-muted">HR Administrator</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emeraldBg text-emeraldTxt border border-emeraldPri/20">
                ● Present
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted border-t border-line pt-2">
              <span>Dept: <strong className="text-ink">People Ops</strong></span>
              <span>Clock In: <strong className="font-mono text-ink">09:02 AM</strong></span>
            </div>
          </div>

          <div
            className="bg-card border border-line rounded-xl p-4 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:border-lineHover"
            onClick={() =>
              setInspectEmployee({
                name: "Daniel Kim",
                code: "EMP-0089",
                role: "Backend Engineer",
                department: "Engineering",
                status: "Present",
                time: "08:47 AM",
              })
            }
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                  DK
                </div>
                <div>
                  <div className="font-semibold text-ink">Daniel Kim</div>
                  <div className="text-xs text-muted">Backend Engineer</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emeraldBg text-emeraldTxt border border-emeraldPri/20">
                ● Present
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted border-t border-line pt-2">
              <span>Dept: <strong className="text-ink">Engineering</strong></span>
              <span>Clock In: <strong className="font-mono text-ink">08:47 AM</strong></span>
            </div>
          </div>
        </div>
      </div>

      <EmployeeDrawer data={inspectEmployee} onClose={() => setInspectEmployee(null)} />
    </div>
  );
}
