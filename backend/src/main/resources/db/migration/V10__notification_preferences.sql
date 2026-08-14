-- ============================================================
-- V10 — Notification preferences + attendance reminder type
-- ============================================================

-- Extend the notifications type check to allow the new attendance
-- reminder type introduced alongside per-employee preferences below.
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('LEAVE_REQUEST_SUBMITTED', 'LEAVE_REQUEST_APPROVED', 'LEAVE_REQUEST_REJECTED',
                     'ATTENDANCE_REMINDER', 'GENERAL'));

-- One row per employee. Rows are created lazily on first read/write
-- (see NotificationPreferenceService) — a missing row means "all on",
-- which is why every column defaults to true rather than requiring a
-- row to exist before an employee can receive anything.
CREATE TABLE notification_preferences (
    id                              BIGSERIAL PRIMARY KEY,
    employee_id                     BIGINT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    leave_decision_enabled          BOOLEAN NOT NULL DEFAULT true,
    new_leave_request_enabled       BOOLEAN NOT NULL DEFAULT true,
    attendance_reminder_enabled     BOOLEAN NOT NULL DEFAULT true,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- End of V10
