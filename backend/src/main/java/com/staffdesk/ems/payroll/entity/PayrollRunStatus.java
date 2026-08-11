package com.staffdesk.ems.payroll.entity;

/** Mirrors payroll_runs.status (§4.2). */
public enum PayrollRunStatus {
    /** Editable/re-runnable. */
    DRAFT,
    /** Payslips generated, still correctable by re-running. */
    PROCESSED,
    /** Immutable audit state once a period is closed out; no further writes to its payslips. */
    LOCKED
}
