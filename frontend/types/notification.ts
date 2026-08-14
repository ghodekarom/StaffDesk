export type NotificationType =
  | "LEAVE_REQUEST_SUBMITTED"
  | "LEAVE_REQUEST_APPROVED"
  | "LEAVE_REQUEST_REJECTED"
  | "ATTENDANCE_REMINDER"
  | "GENERAL";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string; // ISO instant, e.g. "2026-08-01T10:00:00Z"
}

export interface NotificationPage {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationPreferences {
  leaveDecisionEnabled: boolean;
  newLeaveRequestEnabled: boolean;
  attendanceReminderEnabled: boolean;
}