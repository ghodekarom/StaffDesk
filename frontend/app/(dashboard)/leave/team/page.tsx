"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { LeaveRequestRecord, LeaveRequestPage, LeaveStatus, LEAVE_STATUS_LABEL } from "@/types/leave";
import { LeaveRequestTable } from "@/components/leave/leave-request-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-notifications";

const PAGE_SIZE = 20;
const STATUS_FILTERS: (LeaveStatus | "ALL")[] = ["PENDING", "APPROVED", "REJECTED", "ALL"];

export default function TeamLeavePage() {
  const { showToast } = useToast();
  const [page, setPage] = useState<LeaveRequestPage | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetPage: number, filter: LeaveStatus | "ALL") => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<LeaveRequestPage>("/leave/requests", {
        page: targetPage,
        size: PAGE_SIZE,
        ...(filter !== "ALL" ? { status: filter } : {}),
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
    load(pageIndex, statusFilter);
  }, [load, pageIndex, statusFilter]);

  function handleFilterChange(filter: LeaveStatus | "ALL") {
    setStatusFilter(filter);
    setPageIndex(0);
  }

  async function handleApprove(request: LeaveRequestRecord) {
    if (!confirm(`Approve ${request.employeeName}'s ${request.leaveType.toLowerCase()} leave request?`)) {
      return;
    }
    try {
      await api.post(`/leave/requests/${request.id}/approve`, {});
      load(pageIndex, statusFilter);
      showToast(`Leave approved for ${request.employeeName}`, "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to approve leave request.", "error");
    }
  }

  async function handleReject(request: LeaveRequestRecord) {
    const note = prompt("Optional note for the rejection:") ?? undefined;
    try {
      await api.post(`/leave/requests/${request.id}/reject`, { note });
      load(pageIndex, statusFilter);
      showToast(`Leave rejected for ${request.employeeName}`, "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to reject leave request.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Team leave requests</h1>
        <p className="text-sm text-muted">
          {page ? `${page.totalElements} total` : "Loading…"}
        </p>
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? "primary" : "secondary"}
            onClick={() => handleFilterChange(filter)}
          >
            {filter === "ALL" ? "All" : LEAVE_STATUS_LABEL[filter]}
          </Button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      {loading && !page ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Loading leave requests…
        </div>
      ) : page ? (
        <>
          <LeaveRequestTable
            requests={page.content}
            showEmployeeColumn
            onApprove={handleApprove}
            onReject={handleReject}
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
    </div>
  );
}
