-- Direct messages between employees. Deliberately flat (sender/recipient
-- pair + text) rather than a separate "threads" table: a thread is just
-- "all messages between these two employee ids", derivable with a WHERE
-- clause, so there's no join needed to render a conversation.
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_employee_id BIGINT NOT NULL REFERENCES employees(id),
    recipient_employee_id BIGINT NOT NULL REFERENCES employees(id),
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT messages_not_self CHECK (sender_employee_id <> recipient_employee_id)
);

-- Loading "the thread with employee X" filters/sorts by these four columns
-- together (either direction of the pair, newest first) on every poll —
-- worth a composite index rather than relying on the single-column FK
-- indexes Postgres creates automatically.
CREATE INDEX idx_messages_sender_recipient_created
    ON messages (sender_employee_id, recipient_employee_id, created_at DESC);
CREATE INDEX idx_messages_recipient_sender_created
    ON messages (recipient_employee_id, sender_employee_id, created_at DESC);

-- Powers the unread-count badge without scanning the whole table.
CREATE INDEX idx_messages_recipient_unread
    ON messages (recipient_employee_id) WHERE is_read = FALSE;