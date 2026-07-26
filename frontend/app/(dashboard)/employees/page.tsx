"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { Employee, EmployeeRequest, Page } from "@/types/employee";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeForm } from "@/components/employees/employee-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default function EmployeesPage() {
  const [page, setPage] = useState<Page<Employee> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; employee: Employee }>(
    null
  );

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<Page<Employee>>("/employees", {
        page: targetPage,
        size: PAGE_SIZE,
        sort: "lastName,asc",
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
    load(pageIndex);
  }, [load, pageIndex]);

  async function handleCreate(data: EmployeeRequest) {
    await api.post<Employee>("/employees", data);
    setModal(null);
    load(pageIndex);
  }

  async function handleEdit(id: number, data: EmployeeRequest) {
    await api.put<Employee>(`/employees/${id}`, data);
    setModal(null);
    load(pageIndex);
  }

  async function handleDelete(employee: Employee) {
    if (!confirm(`Delete ${employee.firstName} ${employee.lastName}? This can't be undone.`)) {
      return;
    }
    try {
      await api.delete(`/employees/${employee.id}`);
      load(pageIndex);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete employee.");
    }
  }

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

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      {loading && !page ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Loading employees…
        </div>
      ) : page ? (
        <>
          <EmployeeTable
            employees={page.content}
            onEdit={(emp) => setModal({ mode: "edit", employee: emp })}
            onDelete={handleDelete}
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
          <EmployeeForm onSubmit={handleCreate} onCancel={() => setModal(null)} />
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
    </div>
  );
}