"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Employee } from "@/types/employee";
import {
  AttendancePage as AttendancePageType,
  AttendanceRecord,
  AttendanceUpsertRequest,
} from "@/types/attendance";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { AttendanceOverrideForm } from "@/components/attendance/attendance-override-form";
import { Combobox } from "@/components/ui/combobox";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type ModalState =
  | { mode: "edit"; record: AttendanceRecord }
  | { mode: "create" };

function TeamAttendanceContent() {
  const { role, isInitializing } = useAuth();
  const searchParams = useSearchParams();
  const initialEmpId = searchParams.get("employeeId");

  const [employeeId, setEmployeeId] = useState<number | null>(initialEmpId ? parseInt(initialEmpId) : null);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const [page, setPage] = useState<AttendancePageType | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState | null>(null);
  const [newRecordDate, setNewRecordDate] = useState(todayIso());

  const from = isoDaysAgo(30);
  const to = todayIso();

  // Combobox only reports the selected id, so look up the full record
  // ourselves for the name shown in the header and passed to the form.
  useEffect(() => {
    if (employeeId == null) {
      setEmployee(null);
      return;
    }
    api
      .get<Employee>(`/employees/${employeeId}`)
      .then(setEmployee)
      .catch(() => setEmployee(null));
  }, [employeeId]);

  const load = useCallback(
    async (empId: number, targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.get<AttendancePageType>(`/attendance/employees/${empId}`, {
          from,
          to,
          page: targetPage,
          size: PAGE_SIZE,
        });
        setPage(result);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't load attendance for this employee.");
      } finally {
        setLoading(false);
      }
    },
    [from, to]
  );

  useEffect(() => {
    if (employeeId != null) load(employeeId, pageIndex);
  }, [employeeId, pageIndex, load]);

  async function handleSave(date: string, data: AttendanceUpsertRequest) {
    if (employeeId == null) return;
    await api.put<AttendanceRecord>(`/attendance/employees/${employeeId}/${date}`, data);
    setModal(null);
    load(employeeId, pageIndex);
  }

  // Nav already hides this link from other roles, but the route itself
  // needs its own guard since it's reachable directly by URL.
  if (!isInitializing && role !== "ADMIN" && role !== "HR") {
    return (
      <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
        You don&apos;t have access to this page.
      </div>
    );
  }

  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Team attendance</h1>
        <p className="text-sm text-muted">View or correct any employee&apos;s attendance record.</p>
      </div>

      <div className="flex items-end gap-3 rounded-lg border border-line bg-surface p-4">
        <div className="w-72 space-y-1">
          <label htmlFor="team-attendance-employee" className="text-sm font-medium text-ink">Employee</label>
          <Combobox
            id="team-attendance-employee"
            placeholder="Search employees…"
            value={employeeId}
            searchPath="/employees"
            mapOption={(emp: Employee) => ({
              id: emp.id,
              label: `${emp.firstName} ${emp.lastName}`,
              sublabel: emp.employeeCode,
            })}
            onChange={(id) => {
              setEmployeeId(id);
              setPageIndex(0);
              setPage(null);
            }}
          />
        </div>
        {employeeId != null && (
          <Button
            variant="secondary"
            onClick={() => {
              setNewRecordDate(todayIso());
              setModal({ mode: "create" });
            }}
          >
            + Add / override record
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      {employeeId == null ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Search for an employee above to view their attendance.
        </div>
      ) : loading && !page ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Loading…
        </div>
      ) : page ? (
        <>
          <AttendanceTable records={page.content} onEdit={(record) => setModal({ mode: "edit", record })} />

          {page.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button variant="secondary" disabled={page.first} onClick={() => setPageIndex((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {page.number + 1} of {page.totalPages}
              </span>
              <Button variant="secondary" disabled={page.last} onClick={() => setPageIndex((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      ) : null}

      {modal?.mode === "edit" && (
        <Modal title="Edit attendance record" onClose={() => setModal(null)}>
          <AttendanceOverrideForm
            employeeName={employeeName}
            date={modal.record.attendanceDate}
            initial={modal.record}
            onSubmit={(data) => handleSave(modal.record.attendanceDate, data)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.mode === "create" && (
        <Modal title="Add / override attendance record" onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <label htmlFor="new-record-date" className="text-sm font-medium text-ink">
                Date
              </label>
              <input
                id="new-record-date"
                type="date"
                value={newRecordDate}
                max={todayIso()}
                onChange={(e) => setNewRecordDate(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <AttendanceOverrideForm
              employeeName={employeeName}
              date={newRecordDate}
              onSubmit={(data) => handleSave(newRecordDate, data)}
              onCancel={() => setModal(null)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function TeamAttendancePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading attendance...</div>}>
      <TeamAttendanceContent />
    </Suspense>
  );
}