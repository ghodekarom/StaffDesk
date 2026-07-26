"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { Department, DepartmentRequest, DepartmentPage } from "@/types/department";
import { DepartmentTable } from "@/components/departments/department-table";
import { DepartmentForm } from "@/components/departments/department-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default function DepartmentsPage() {
  const [page, setPage] = useState<DepartmentPage | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<
    null | { mode: "create" } | { mode: "edit"; department: Department }
  >(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<DepartmentPage>("/departments", {
        page: targetPage,
        size: PAGE_SIZE,
        sort: "name,asc",
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

  async function handleCreate(data: DepartmentRequest) {
    await api.post<Department>("/departments", data);
    setModal(null);
    load(pageIndex);
  }

  async function handleEdit(id: number, data: DepartmentRequest) {
    await api.put<Department>(`/departments/${id}`, data);
    setModal(null);
    load(pageIndex);
  }

  async function handleDelete(department: Department) {
    if (
      !confirm(
        `Delete ${department.name}? Employees in this department will be un-assigned, not deleted.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/departments/${department.id}`);
      load(pageIndex);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete department.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Departments</h1>
          <p className="text-sm text-muted">
            {page ? `${page.totalElements} total` : "Loading…"}
          </p>
        </div>
        <Button onClick={() => setModal({ mode: "create" })}>+ Add department</Button>
      </div>

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      {loading && !page ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Loading departments…
        </div>
      ) : page ? (
        <>
          <DepartmentTable
            departments={page.content}
            onEdit={(dept) => setModal({ mode: "edit", department: dept })}
            onDelete={handleDelete}
          />

          {page.totalPages > 1 && (
            <div className="flex items-center justify-between">
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
        <Modal title="Add department" onClose={() => setModal(null)}>
          <DepartmentForm onSubmit={handleCreate} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal title="Edit department" onClose={() => setModal(null)}>
          <DepartmentForm
            initial={modal.department}
            onSubmit={(data) => handleEdit(modal.department.id, data)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
