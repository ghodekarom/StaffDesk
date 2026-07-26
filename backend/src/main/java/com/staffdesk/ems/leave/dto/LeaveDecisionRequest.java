package com.staffdesk.ems.leave.dto;

import jakarta.validation.constraints.Size;

// Body for the approve/reject endpoints. Optional note from the approver
// (e.g. rejection reason) — not required, since "Reject" with no comment is valid.
public class LeaveDecisionRequest {

    @Size(max = 1000, message = "Note must be 1000 characters or fewer")
    private String note;

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
