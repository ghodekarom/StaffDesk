"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 10;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Wraps a value in quotes and escapes any embedded quotes, per RFC 4180 —
// needed so a stray comma in future data (or Excel locale settings) can't
// silently shift columns.
function csvCell(value: string | number): string {
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export default function PayrollPage() {
  const { role } = useAuth();
  const { showToast } = useToast();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [processing, setProcessing] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<PayrollRunRecord | null>(null);
  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [loadingPayslips, setLoadingPayslips] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Search + pagination are client-side over the already-loaded payslips list
  // (a single run's payslips, bounded by employee count — no backend change
  // needed). Search matches Employee ID as a substring, e.g. "12" matches 12,
  // 120, 512.
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const isAuthorized = role === "ADMIN" || role === "HR";

  const filteredPayslips = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return payslips;
    return payslips.filter((p) => String(p.employeeId).includes(query));
  }, [payslips, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPayslips.length / PAGE_SIZE));
  const pagedPayslips = filteredPayslips.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);

  // Reset to page 1 whenever the search narrows/widens the result set, or a
  // fresh payslips list comes in (new run loaded/processed) — otherwise a
  // stale pageIndex could point past the end of a shorter filtered list.
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, payslips]);

  const loadPayslips = useCallback(async (runId: number) => {
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
  }, [showToast]);

  // Restores an already-processed run for the selected month/year, so
  // switching tabs (which unmounts/remounts this page) or changing the
  // month/year picker doesn't silently forget a run that was already
  // generated earlier in the session.
  const loadExistingRun = useCallback(
    async (targetMonth: number, targetYear: number) => {
      setCheckingExisting(true);
      setError(null);
      setRun(null);
      setPayslips([]);
      try {
        const result = await api.get<PayrollRunRecord>(`/payroll/runs/${targetYear}/${targetMonth}`, undefined, {
          fresh: true,
        });
        setRun(result);
        await loadPayslips(result.id);
      } catch (err) {
        // 404 just means nothing's been processed for this period yet —
        // that's a normal, expected state, not an error to surface.
        if (err instanceof ApiError && err.status === 404) {
          return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : "Couldn't reach the server. Is the backend running on :8080?";
        setError(message);
      } finally {
        setCheckingExisting(false);
      }
    },
    [loadPayslips]
  );

  useEffect(() => {
    if (isAuthorized) {
      loadExistingRun(month, year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, isAuthorized]);

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

  function handleDownloadAllCsv() {
    if (payslips.length === 0 || !run) return;

    // Exports the full run, not just the current search/page — a search
    // narrows what you're looking at on screen, not what you'd expect a
    // "download all" button to give you.
    const header = [
      "Employee ID",
      "Working Days",
      "Paid Days",
      "Gross Earnings",
      "Total Deductions",
      "Net Pay",
    ];

    const rows = payslips.map((p) => [
      p.employeeId,
      p.workingDays,
      p.paidDays,
      p.grossEarnings,
      p.totalDeductions,
      p.netPay,
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

    // Prefix with a UTF-8 BOM so Excel (Windows) doesn't mis-detect the
    // encoding and mangle the ₹ symbol or any non-ASCII names later.
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payroll-${run.periodYear}-${String(run.periodMonth).padStart(2, "0")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

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
            {processing ? "Processing…" : run ? "Reprocess payroll" : "Process payroll"}
          </Button>
        </div>
      </div>

      {checkingExisting ? (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          Checking for an existing run…
        </div>
      ) : run ? (
        <div className="rounded-lg border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-medium text-ink">
              {MONTH_LABEL[run.periodMonth]} {run.periodYear} — {run.status}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                {payslips.length > 0 ? `${payslips.length} payslip(s)` : ""}
              </span>
              {payslips.length > 0 && (
                <Button onClick={handleDownloadAllCsv}>Download all (CSV)</Button>
              )}
            </div>
          </div>

          {loadingPayslips ? (
            <div className="py-10 text-center text-sm text-muted">Loading payslips…</div>
          ) : payslips.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted">No payslips generated for this run.</div>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Search by Employee ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>

              {filteredPayslips.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted">
                  No payslips match Employee ID &quot;{searchQuery}&quot;.
                </div>
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
                        {pagedPayslips.map((p) => (
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
                    {pagedPayslips.map((p) => (
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

                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                      <Button
                        variant="secondary"
                        disabled={pageIndex === 0}
                        onClick={() => setPageIndex((p) => p - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted">
                        Page {pageIndex + 1} of {totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        disabled={pageIndex >= totalPages - 1}
                        onClick={() => setPageIndex((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-surface py-16 text-center text-sm text-muted">
          No payroll run yet for {MONTH_LABEL[month]} {year}. Click &quot;Process payroll&quot; above to generate one.
        </div>
      )}
    </div>
  );
}