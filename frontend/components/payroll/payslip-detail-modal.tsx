"use client";

import { PayslipRecord, MONTH_LABEL } from "@/types/payroll";
import { Modal } from "@/components/ui/modal";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PayslipDetailModalProps {
  payslip: PayslipRecord;
  onClose: () => void;
  // Admin/HR context shows "Employee {id}" since that's all the row has;
  // the employee self-service page omits this (it's obviously their own).
  employeeLabel?: string;
}

export function PayslipDetailModal({ payslip, onClose, employeeLabel }: PayslipDetailModalProps) {
  return (
    <Modal title={`${MONTH_LABEL[payslip.periodMonth]} ${payslip.periodYear} Payslip`} onClose={onClose}>
      <div className="flex flex-col gap-5">
        {(employeeLabel || payslip.generatedAt) && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            {employeeLabel && <span>{employeeLabel}</span>}
            <span>Generated {formatDate(payslip.generatedAt)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 rounded-lg border border-line p-3 text-sm">
          <div>
            <div className="text-muted">Working days</div>
            <div className="text-ink font-medium">{payslip.workingDays}</div>
          </div>
          <div>
            <div className="text-muted">Paid days</div>
            <div className="text-ink font-medium">{payslip.paidDays}</div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted mb-2">Earnings</h3>
          <div className="rounded-lg border border-line overflow-hidden">
            {payslip.earnings.map((e, idx) => (
              <div
                key={e.componentName}
                className={`flex items-center justify-between px-3 py-2 text-sm ${
                  idx % 2 === 1 ? "bg-white/[0.02]" : ""
                }`}
              >
                <span className="text-ink">{e.componentName}</span>
                <span className="text-ink">{formatCurrency(e.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 text-sm border-t border-line bg-white/[0.03] font-medium">
              <span className="text-ink">Gross Earnings</span>
              <span className="text-ink">{formatCurrency(payslip.grossEarnings)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted mb-2">Deductions</h3>
          <div className="rounded-lg border border-line overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-ink">PF (Employee)</span>
              <span className="text-ink">{formatCurrency(payslip.pfEmployee)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm bg-white/[0.02]">
              <span className="text-ink">ESI (Employee)</span>
              <span className="text-ink">{formatCurrency(payslip.esiEmployee)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-ink">Professional Tax</span>
              <span className="text-ink">{formatCurrency(payslip.professionalTax)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm bg-white/[0.02]">
              <span className="text-ink">TDS</span>
              <span className="text-ink">{formatCurrency(payslip.tds)}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm border-t border-line bg-white/[0.03] font-medium">
              <span className="text-ink">Total Deductions</span>
              <span className="text-ink">{formatCurrency(payslip.totalDeductions)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-line bg-white/[0.03] px-4 py-3">
          <span className="text-sm font-medium text-ink">Net Pay</span>
          <span className="text-lg font-semibold text-ink">{formatCurrency(payslip.netPay)}</span>
        </div>

        {/* Employer-side contributions aren't deducted from pay — shown as an
            informational footnote only, matching the PDF's own footnote. */}
        <p className="text-xs text-muted">
          Employer PF contribution (not deducted from pay): {formatCurrency(payslip.pfEmployer)} · Employer ESI
          contribution: {formatCurrency(payslip.esiEmployer)}
        </p>
      </div>
    </Modal>
  );
}