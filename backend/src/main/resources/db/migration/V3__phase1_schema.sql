-- ============================================================
-- V3 — Notifications
-- ============================================================

CREATE TABLE notifications (
    id                      BIGSERIAL PRIMARY KEY,
    recipient_employee_id   BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type                    VARCHAR(30) NOT NULL
                            CHECK (type IN ('LEAVE_REQUEST_SUBMITTED', 'LEAVE_REQUEST_APPROVED', 'LEAVE_REQUEST_REJECTED', 'GENERAL')),
    title                   VARCHAR(255) NOT NULL,
    message                 TEXT NOT NULL,
    link                    VARCHAR(255),
    is_read                 BOOLEAN NOT NULL DEFAULT false,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Covers both the unread-count badge query and the "read = false" filter
-- inside the paginated list, without a full table scan as volume grows.
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_employee_id, is_read);

-- Covers the paginated "latest notifications" list (ORDER BY created_at DESC).
CREATE INDEX idx_notifications_recipient_created ON notifications(recipient_employee_id, created_at DESC);

-- ============================================================
-- End of V3
-- ============================================================