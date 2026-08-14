"use client";

import { useCallback, useEffect, useState } from "react";
import { api, apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PayslipRecord, MONTH_LABEL } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-notifications";
import { PayslipDetailModal } from "@/components/payroll/payslip-detail-modal";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MyPayslipsPage() {
  const { role, isInitializing } = useAuth();
  const { showToast } = useToast();

  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [detailPayslip, setDetailPayslip] = useState<PayslipRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<PayslipRecord[]>("/payroll/payslips/me");
      setPayslips(result);
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
    load();
  }, [load]);

  async function handleDownloadPdf(payslip: PayslipRecord) {
    setDownloadingId(payslip.id);
    try {
      const response = await apiFetch(`/payroll/payslips/${payslip.id}/pdf`);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new ApiError(
          errorBody?.message ?? `Couldn't download payslip PDF (${response.status})`,
          response.status,
          errorBody
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payslip-${MONTH_LABEL[payslip.periodMonth]}-${payslip.periodYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't reach the server to download the PDF.";
      showToast(message, "error");
    } finally {
      setDownloadingId(null);
    }
  }

  // Route needs its own guard since it's reachable directly by URL, same as
  // attendance/team's page guard. The backend's GET /payroll/payslips/me is
  // @PreAuthorize("hasRole('EMPLOYEE')") specifically (not ADMIN/HR) — see
  // PayslipController — so this mirrors that exactly rather than allowing
  // ADMIN/HR through here only to hit a 403 on load.
  if (!isInitializing && role !== "EMPLOYEE") {
    return (
      <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
        This page is for employee self-service payslip access.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Payslips</h1>
        <p className="text-sm text-muted">View and download your payslips.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Loading…
        </div>
      ) : payslips.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          No payslips yet.
        </div>
      ) : (
        <>
          {/* Table — md and up. Same breakpoint pattern as the admin payroll page:
              enough columns that it doesn't fit a phone width without scrolling
              data out of view, so cards take over below md. */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-line">
                  <th className="py-3 px-4 font-medium">Period</th>
                  <th className="py-3 px-4 font-medium">Paid days</th>
                  <th className="py-3 px-4 font-medium">Gross</th>
                  <th className="py-3 px-4 font-medium">Deductions</th>
                  <th className="py-3 px-4 font-medium">Net pay</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((p) => (
                  <tr key={p.id} className="border-b border-line/50 text-ink">
                    <td className="py-3 px-4">
                      {MONTH_LABEL[p.periodMonth]} {p.periodYear}
                    </td>
                    <td className="py-3 px-4">{p.paidDays}</td>
                    <td className="py-3 px-4">{formatCurrency(p.grossEarnings)}</td>
                    <td className="py-3 px-4">{formatCurrency(p.totalDeductions)}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(p.netPay)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => setDetailPayslip(p)}>
                          View
                        </Button>
                        <Button onClick={() => handleDownloadPdf(p)} disabled={downloadingId === p.id}>
                          {downloadingId === p.id ? "Downloading…" : "Download PDF"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — below md. Net pay leads each card, same as the admin page's
              mobile layout, since that's the number someone checks first. */}
          <div className="flex flex-col gap-3 md:hidden">
            {payslips.map((p) => (
              <div key={p.id} className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    {MONTH_LABEL[p.periodMonth]} {p.periodYear}
                  </span>
                  <span className="text-base font-medium text-ink">{formatCurrency(p.netPay)}</span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-muted">Paid days</dt>
                  <dd className="text-right text-ink">{p.paidDays}</dd>

                  <dt className="text-muted">Gross</dt>
                  <dd className="text-right text-ink">{formatCurrency(p.grossEarnings)}</dd>

                  <dt className="text-muted">Deductions</dt>
                  <dd className="text-right text-ink">{formatCurrency(p.totalDeductions)}</dd>
                </dl>

                <Button
                  onClick={() => handleDownloadPdf(p)}
                  disabled={downloadingId === p.id}
                  className="mt-4 w-full"
                >
                  {downloadingId === p.id ? "Downloading…" : "Download PDF"}
                </Button>
                <Button variant="secondary" onClick={() => setDetailPayslip(p)} className="mt-2 w-full">
                  View details
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {detailPayslip && (
        <PayslipDetailModal payslip={detailPayslip} onClose={() => setDetailPayslip(null)} />
      )}
    </div>
  );
}