// Mirrors AttendanceResponse.java / AttendanceUpsertRequest.java
import { Page } from "@/types/employee";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LATE";

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string | null;
  attendanceDate: string; // ISO date, e.g. "2026-07-25"
  clockIn: string | null; // ISO instant, e.g. "2026-07-25T09:03:12Z"
  clockOut: string | null;
  status: AttendanceStatus;
  createdAt: string;
}

// For PUT /attendance/employees/{employeeId}/{date} (HR manual create/override)
export interface AttendanceUpsertRequest {
  clockIn: string | null; // ISO instant or null
  clockOut: string | null;
  status: AttendanceStatus;
}

export type AttendancePage = Page<AttendanceRecord>;

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  HALF_DAY: "Half day",
  LATE: "Late",
};