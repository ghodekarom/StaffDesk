"use client";

import { useState } from "react";
import { api, apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PayrollRunRecord, PayslipRecord, MONTH_LABEL } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-notifications";

// Runs further back than this are treated as historical review, not something
// this screen is meant to trigger — kept narrow since a payroll run needs real
// attendance/leave data for the period, which won't exist for future months.
// Not specified anywhere in the scoping doc; flagging as an assumption.
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];
const MONTH_OPTIONS = Object.entries(MONTH_LABEL).map(([value, label]) => ({
  value: Number(value),
  label,
}));

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PayrollPage() {
  const { role } = useAuth();
  const { showToast } = useToast();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<PayrollRunRecord | null>(null);
  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [loadingPayslips, setLoadingPayslips] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const isAuthorized = role === "ADMIN" || role === "HR";

  async function handleProcess() {
    if (!confirm(`Process payroll for ${MONTH_LABEL[month]} ${year}? This generates payslips for every employee.`)) {
      return;
    }

    setProcessing(true);
    setError(null);
    setPayslips([]);

    try {
      const result = await api.post<PayrollRunRecord>(`/payroll/runs/${year}/${month}/process`);
      setRun(result);
      showToast(`Payroll processed for ${MONTH_LABEL[month]} ${year}`, "success");
      await loadPayslips(result.id);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Is the backend running on :8080?";
      setError(message);
      showToast(message, "error");
    } finally {
      setProcessing(false);
    }
  }

  async function loadPayslips(runId: number) {
    setLoadingPayslips(true);
    try {
      const result = await api.get<PayslipRecord[]>(`/payroll/runs/${runId}/payslips`, undefined, {
        fresh: true,
      });
      setPayslips(result);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to load payslips for this run.", "error");
    } finally {
      setLoadingPayslips(false);
    }
  }

  async function handleDownloadPdf(payslip: PayslipRecord) {
    setDownloadingId(payslip.id);
    try {
      const response = await apiFetch(`/payroll/payslips/${payslip.id}/pdf`);
      if (!response.ok) {
        throw new ApiError(`Couldn't download payslip PDF (${response.status})`, response.status);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payslip-${payslip.id}.pdf`;
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

  if (!isAuthorized) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Payroll</h1>
        </div>
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          You don&apos;t have access to payroll. This section is restricted to Admin and HR.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Payroll</h1>
        <p className="text-sm text-muted">Run monthly payroll and generate payslips.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-status-terminated/30 bg-status-terminatedBg px-4 py-3 text-sm text-status-terminated">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-medium text-ink mb-4">Process a payroll run</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Month</span>
            <select
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              value={month}
              disabled={processing}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Year</span>
            <select
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
              value={year}
              disabled={processing}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <Button onClick={handleProcess} disabled={processing}>
            {processing ? "Processing…" : "Process payroll"}
          </Button>
        </div>
      </div>

      {run && (
        <div className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-ink">
              {MONTH_LABEL[run.periodMonth]} {run.periodYear} — {run.status}
            </h2>
            <span className="text-xs text-muted">
              {payslips.length > 0 ? `${payslips.length} payslip(s)` : ""}
            </span>
          </div>

          {loadingPayslips ? (
            <div className="py-10 text-center text-sm text-muted">Loading payslips…</div>
          ) : payslips.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted">No payslips generated for this run.</div>
          ) : (
            <>
              {/* Table — md and up. Six-plus columns don't fit a phone width without
                  scrolling data out of view, so this is swapped for stacked cards below md. */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-line">
                      <th className="py-2 pr-4 font-medium">Employee ID</th>
                      <th className="py-2 pr-4 font-medium">Working days</th>
                      <th className="py-2 pr-4 font-medium">Paid days</th>
                      <th className="py-2 pr-4 font-medium">Gross</th>
                      <th className="py-2 pr-4 font-medium">Deductions</th>
                      <th className="py-2 pr-4 font-medium">Net pay</th>
                      <th className="py-2 pr-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map((p) => (
                      <tr key={p.id} className="border-b border-line/50 text-ink">
                        <td className="py-2 pr-4">{p.employeeId}</td>
                        <td className="py-2 pr-4">{p.workingDays}</td>
                        <td className="py-2 pr-4">{p.paidDays}</td>
                        <td className="py-2 pr-4">{formatCurrency(p.grossEarnings)}</td>
                        <td className="py-2 pr-4">{formatCurrency(p.totalDeductions)}</td>
                        <td className="py-2 pr-4 font-medium">{formatCurrency(p.netPay)}</td>
                        <td className="py-2 pr-4">
                          <Button
                            onClick={() => handleDownloadPdf(p)}
                            disabled={downloadingId === p.id}
                          >
                            {downloadingId === p.id ? "Downloading…" : "Download PDF"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards — below md. Net pay is the one number someone scanning on a
                  phone actually needs first, so it leads each card; everything else
                  is a label/value row instead of table columns squeezed into 375px. */}
              <div className="flex flex-col gap-3 md:hidden">
                {payslips.map((p) => (
                  <div key={p.id} className="rounded-lg border border-line p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Employee {p.employeeId}</span>
                      <span className="text-base font-medium text-ink">{formatCurrency(p.netPay)}</span>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                      <dt className="text-muted">Working days</dt>
                      <dd className="text-right text-ink">{p.workingDays}</dd>

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
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}