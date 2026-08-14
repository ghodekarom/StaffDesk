// Mirrors PayrollRunResponse.java / PayslipResponse.java / PayslipEarningResponse.java

export type PayrollRunStatus = "DRAFT" | "PROCESSED" | "LOCKED";

export interface PayrollRunRecord {
  id: number;
  periodMonth: number;
  periodYear: number;
  status: PayrollRunStatus;
  processedAt: string | null; // ISO instant
  processedBy: number | null;
}

export interface PayslipEarning {
  componentName: string;
  amount: number;
}

export interface PayslipRecord {
  id: number;
  payrollRunId: number;
  employeeId: number;
  employeeName: string;
  periodMonth: number;
  periodYear: number;
  workingDays: number;
  paidDays: number;
  grossEarnings: number;
  pfEmployee: number;
  pfEmployer: number;
  esiEmployee: number;
  esiEmployer: number;
  professionalTax: number;
  tds: number;
  totalDeductions: number;
  netPay: number;
  pdfAvailable: boolean;
  generatedAt: string; // ISO instant
  earnings: PayslipEarning[];
}

export const MONTH_LABEL: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};