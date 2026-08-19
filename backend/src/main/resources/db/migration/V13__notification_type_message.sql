-- ============================================================
-- V13 — Extend notifications type check to allow MESSAGE
-- ============================================================

-- Same follow-up V10 had to do for ATTENDANCE_REMINDER: the Java-side
-- enum (Notification.Type) got a new MESSAGE constant for the direct
-- messages feature, but the DB-level CHECK constraint on notifications.type
-- is a separate, independent list that has to be extended by hand — it's
-- not derived from the enum automatically. Missing this step is exactly
-- what caused inserts to fail with a DataIntegrityViolationException
-- (surfacing to the client as a generic 500) when sending a message.
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('LEAVE_REQUEST_SUBMITTED', 'LEAVE_REQUEST_APPROVED', 'LEAVE_REQUEST_REJECTED',
                     'ATTENDANCE_REMINDER', 'MESSAGE', 'GENERAL'));

-- ============================================================
-- End of V13