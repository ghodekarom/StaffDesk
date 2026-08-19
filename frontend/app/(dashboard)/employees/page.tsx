"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { Employee, Page } from "@/types/employee";
import { RegisterPayload } from "@/types/auth";
import { EmployeeTable, EmployeeTableSkeleton } from "@/components/employees/employee-table";
import { EmployeeForm, EmployeeFormSubmitData } from "@/components/employees/employee-form";
import { CreateLoginModal } from "@/components/employees/create-login-modal";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const PAGE_SIZE = 20;

export default function EmployeesPage() {
  const { role } = useAuth();
  const [page, setPage] = useState<Page<Employee> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [departments, setDepartments] = useState<any[]>([]);

  const [modal, setModal] = useState<
    null | { mode: "create" } | { mode: "edit"; employee: Employee } | { mode: "create-login"; employee: Employee }
  >(null);

  useEffect(() => {
    api.get<{ content: any[] }>("/departments", { size: 100 })
      .then((res) => setDepartments(res.content))
      .catch((err) => console.error("Failed to load departments", err));
  }, []);

  const load = useCallback(async (targetPage: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<Page<Employee>>("/employees", {
        page: targetPage,
        size: PAGE_SIZE,
        sort: "lastName,asc",
        ...(query ? { search: query } : {}),
      });
      setPage(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Is the backend running on :8080?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(pageIndex, searchQuery);
  }, [load, pageIndex, searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPageIndex(0);
  };

  const handleInspect = (emp: Employee) => {
    const detail = {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      code: emp.employeeCode,
      role: emp.designation || "Staff",
      department: emp.departmentName || "General",
      status: emp.status === "ACTIVE" ? "Active" : emp.status === "INACTIVE" ? "Inactive" : "Terminated",
      email: emp.email,
    };
    window.dispatchEvent(new CustomEvent("inspect-employee", { detail }));
  };

  async function handleCreate({ employee, login }: EmployeeFormSubmitData) {
    const created = await api.post<Employee>("/employees", employee);

    if (login) {
      try {
        await api.post("/auth/register", { employeeId: created.id, ...login });
      } catch (err) {
        // The employee record was created successfully -- don't lose that
        // by throwing here (which would leave the modal open and imply
        // nothing happened). Surface the login failure separately; the
        // row will just show "No login" and can be retried from its
        // per-row "Create login" action.
        setModal(null);
        load(pageIndex, searchQuery);
        alert(
          `${employee.firstName} ${employee.lastName} was added, but creating their login failed: ` +
            (err instanceof ApiError ? err.message : "Something went wrong.") +
            ` Use "Create login" on their row to try again.`
        );
        return;
      }
    }

    setModal(null);
    load(pageIndex, searchQuery);
  }

  async function handleEdit(id: number, { employee }: EmployeeFormSubmitData) {
    await api.put<Employee>(`/employees/${id}`, employee);
    setModal(null);
    load(pageIndex, searchQuery);
  }

  async function handleCreateLogin(data: RegisterPayload) {
    await api.post("/auth/register", data);
    setModal(null);
    load(pageIndex, searchQuery);
  }

  async function handleDelete(employee: Employee) {
    if (!confirm(`Delete ${employee.firstName} ${employee.lastName}? This can't be undone.`)) {
      return;
    }
    try {
      await api.delete(`/employees/${employee.id}`);
      load(pageIndex, searchQuery);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete employee.");
    }
  }

  const filteredEmployees = page?.content.filter((emp) => {
    if (selectedDept !== "ALL" && emp.departmentName !== selectedDept) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Stacks on mobile, sits side-by-side from sm up */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Employees</h1>
          <p className="text-sm text-muted">
            {page ? `${page.totalElements} total` : "Loading…"}
          </p>
        </div>
        <Button onClick={() => setModal({ mode: "create" })} className="sm:w-auto">
          + Add employee
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-line bg-surface text-ink text-sm outline-none focus:border-accent"
          />
          <div className="absolute left-3 top-3 text-muted">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="h-10 px-3 rounded-lg border border-line bg-surface text-ink text-sm outline-none focus:border-accent min-w-[160px]"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      {loading && !page ? (
        <EmployeeTableSkeleton />
      ) : page ? (
        <>
          <EmployeeTable
            employees={filteredEmployees}
            onEdit={(emp) => setModal({ mode: "edit", employee: emp })}
            onDelete={handleDelete}
            onInspect={handleInspect}
            canCreateLogin={role === "ADMIN"}
            onCreateLogin={(emp) => setModal({ mode: "create-login", employee: emp })}
          />

          {page.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="secondary"
                disabled={page.first}
                onClick={() => setPageIndex((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted">
                Page {page.number + 1} of {page.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page.last}
                onClick={() => setPageIndex((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : null}

      {modal?.mode === "create" && (
        <Modal title="Add employee" onClose={() => setModal(null)}>
          <EmployeeForm
            onSubmit={handleCreate}
            onCancel={() => setModal(null)}
            allowInlineLogin={role === "ADMIN"}
          />
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal title="Edit employee" onClose={() => setModal(null)}>
          <EmployeeForm
            initial={modal.employee}
            onSubmit={(data) => handleEdit(modal.employee.id, data)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.mode === "create-login" && (
        <Modal title="Create login" onClose={() => setModal(null)}>
          <CreateLoginModal
            employee={modal.employee}
            onSubmit={handleCreateLogin}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}