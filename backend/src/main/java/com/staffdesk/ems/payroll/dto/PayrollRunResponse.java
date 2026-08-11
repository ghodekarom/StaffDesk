package com.staffdesk.ems.payroll.dto;

import com.staffdesk.ems.payroll.entity.PayrollRun;

import java.time.Instant;

public class PayrollRunResponse {

    private final Long id;
    private final Integer periodMonth;
    private final Integer periodYear;
    private final String status;
    private final Instant processedAt;
    private final Long processedBy;

    private PayrollRunResponse(Long id, Integer periodMonth, Integer periodYear, String status,
                                Instant processedAt, Long processedBy) {
        this.id = id;
        this.periodMonth = periodMonth;
        this.periodYear = periodYear;
        this.status = status;
        this.processedAt = processedAt;
        this.processedBy = processedBy;
    }

    public static PayrollRunResponse from(PayrollRun run) {
        return new PayrollRunResponse(
                run.getId(), run.getPeriodMonth(), run.getPeriodYear(),
                run.getStatus().name(), run.getProcessedAt(), run.getProcessedBy());
    }

    public Long getId() {
        return id;
    }

    public Integer getPeriodMonth() {
        return periodMonth;
    }

    public Integer getPeriodYear() {
        return periodYear;
    }

    public String getStatus() {
        return status;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public Long getProcessedBy() {
        return processedBy;
    }
}
