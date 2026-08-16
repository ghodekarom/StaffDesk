-- Supports the new GET /api/v1/dashboard/summary endpoint
-- (DashboardService / AttendanceRepository), which queries attendance by
-- attendance_date (and attendance_date + status) across ALL employees --
-- unlike the existing idx_attendance_employee_date index, which only helps
-- lookups scoped to a single employee_id. Without this, those aggregate
-- queries fall back to a sequential scan of the whole attendance table.
CREATE INDEX idx_attendance_date_status ON attendance(attendance_date, status);