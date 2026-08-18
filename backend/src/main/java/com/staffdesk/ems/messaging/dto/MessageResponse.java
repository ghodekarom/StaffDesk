package com.staffdesk.ems.messaging.dto;

import com.staffdesk.ems.messaging.entity.Message;

import java.time.Instant;

public record MessageResponse(
        Long id,
        Long senderEmployeeId,
        Long recipientEmployeeId,
        String body,
        boolean read,
        Instant createdAt
) {
    public static MessageResponse from(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getSenderEmployeeId(),
                m.getRecipientEmployeeId(),
                m.getBody(),
                m.isRead(),
                m.getCreatedAt()
        );
    }
}