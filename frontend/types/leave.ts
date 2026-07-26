// Mirrors LeaveRequestResponse.java / LeaveBalanceResponse.java / LeaveRequestCreateRequest.java
import { Page } from "@/types/employee";

export type LeaveType = "SICK" | "CASUAL" | "EARNED";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveRequestRecord {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string; // ISO date
  endDate: string; // ISO date
  days: number;
  status: LeaveStatus;
  approvedById: number | null;
  approvedByName: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestCreateRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string | null;
}

export interface LeaveDecisionRequest {
  note?: string | null;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  leaveType: LeaveType;
  year: number;
  total: number;
  used: number;
  remaining: number;
}

export type LeaveRequestPage = Page<LeaveRequestRecord>;

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  SICK: "Sick",
  CASUAL: "Casual",
  EARNED: "Earned",
};

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};
