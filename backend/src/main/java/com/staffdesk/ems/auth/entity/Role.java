package com.staffdesk.ems.auth.entity;

/**
 * Mirrors the CHECK constraint on users.role in the Phase 1 schema:
 * CHECK (role IN ('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'))
 */
public enum Role {
    ADMIN,
    HR,
    MANAGER,
    EMPLOYEE
}
