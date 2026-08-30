-- ============================================================
-- V16 — Harden employee FK constraints to prevent accidental hard delete
-- ============================================================
-- Issues #20 & #21: The application layer (EmployeeServiceImpl.delete())
-- already does a soft delete (sets status to INACTIVE), but the DB schema
-- has ON DELETE CASCADE on most employee FK relationships. If anyone
-- bypasses the service and runs a raw SQL DELETE, all attendance, leave,
-- payroll, and notification history is silently destroyed.
--
-- The messages table (V12) is the worst case: it has bare REFERENCES with
-- no cascade rule at all, meaning a hard delete crashes with an FK
-- violation instead of failing gracefully.
--
-- This migration changes the messages table FK constraints to ON DELETE
-- RESTRICT, making the database actively prevent accidental hard deletes.
-- The other tables (users, attendance, leave_requests, leave_balances,
-- salary_structures, payslips, notifications) retain ON DELETE CASCADE
-- for now — a future migration can harden those too once the team
-- confirms no tooling depends on cascade deletes.

-- Drop and recreate the sender FK with RESTRICT
ALTER TABLE messages DROP CONSTRAINT messages_sender_employee_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_employee_id_fkey
    FOREIGN KEY (sender_employee_id) REFERENCES employees(id) ON DELETE RESTRICT;

-- Drop and recreate the recipient FK with RESTRICT
ALTER TABLE messages DROP CONSTRAINT messages_recipient_employee_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_recipient_employee_id_fkey
    FOREIGN KEY (recipient_employee_id) REFERENCES employees(id) ON DELETE RESTRICT;

-- ============================================================
-- End of V16
-- ============================================================
