package com.staffdesk.ems.messaging.dto;

import java.time.Instant;

public record ThreadSummaryResponse(
        Long otherEmployeeId,
        String otherEmployeeName,
        String lastMessageBody,
        Instant lastMessageAt,
        boolean lastMessageMine,
        long unreadCount
) {
}