package com.staffdesk.ems.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotNull Long recipientEmployeeId,
        @NotBlank @Size(max = 4000) String body
) {
}