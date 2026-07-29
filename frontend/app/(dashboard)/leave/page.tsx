"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  LeaveRequestRecord,
  LeaveRequestCreateRequest,
  LeaveRequestPage,
  LeaveBalance,
} from "@/types/leave";
import { LeaveRequestTable } from "@/components/leave/leave-request-table";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { LeaveBalanceCards } from "@/components/leave/leave-balance-cards";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-notifications";

const PAGE_SIZE = 20;

export default function LeavePage() {
  const { role } = useAuth();
  const { showToast } = useToast();
  const canReviewTeam = role === "ADMIN" || role === "HR" || role === "MANAGER";

  const [page, setPage] = useState<LeaveRequestPage | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const [requests, balanceList] = await Promise.all([
        api.get<LeaveRequestPage>("/leave/requests/me", {
          page: targetPage,
          size: PAGE_SIZE,
        }),
        api.get<LeaveBalance[]>("/leave/balances/me"),
      ]);
      setPage(requests);
      setBalances(balanceList);
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

  async function handleCreate(data: LeaveRequestCreateRequest) {
    try {
      await api.post<LeaveRequestRecord>("/leave/requests", data);
      setShowForm(false);
      load(pageIndex);
      showToast("Leave request submitted successfully", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to request leave.", "error");
    }
  }

  async function handleCancel(request: LeaveRequestRecord) {
    if (!confirm(`Cancel your ${request.leaveType.toLowerCase()} leave request?`)) {
      return;
    }
    try {
      await api.post(`/leave/requests/${request.id}/cancel`);
      load(pageIndex);
      showToast("Leave request cancelled", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to cancel leave request.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Leave</h1>
          <p className="text-sm text-muted">
            {page ? `${page.totalElements} total requests` : "Loading…"}
          </p>
        </div>
        <div className="flex gap-2">
          {canReviewTeam && (
            <Link href="/leave/team">
              <Button variant="secondary">Review team requests</Button>
            </Link>
          )}
          <Button onClick={() => setShowForm(true)}>+ Request leave</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      {!loading && <LeaveBalanceCards balances={balances} />}

      {loading && !page ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Loading leave requests…
        </div>
      ) : page ? (
        <>
          <LeaveRequestTable requests={page.content} onCancel={handleCancel} />

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

      {showForm && (
        <Modal title="Request leave" onClose={() => setShowForm(false)}>
          <LeaveRequestForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
