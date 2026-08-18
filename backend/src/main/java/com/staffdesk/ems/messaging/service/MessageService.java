package com.staffdesk.ems.messaging.service;

import com.staffdesk.ems.common.exception.ResourceNotFoundException;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.messaging.dto.MessageResponse;
import com.staffdesk.ems.messaging.dto.SendMessageRequest;
import com.staffdesk.ems.messaging.entity.Message;
import com.staffdesk.ems.messaging.repository.MessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final EmployeeRepository employeeRepository;

    public MessageService(MessageRepository messageRepository, EmployeeRepository employeeRepository) {
        this.messageRepository = messageRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public MessageResponse send(Long senderEmployeeId, SendMessageRequest request) {
        if (senderEmployeeId.equals(request.recipientEmployeeId())) {
            throw new IllegalArgumentException("Cannot send a direct message to yourself");
        }
        if (!employeeRepository.existsById(request.recipientEmployeeId())) {
            throw new ResourceNotFoundException("Employee not found: " + request.recipientEmployeeId());
        }

        Message message = new Message();
        message.setSenderEmployeeId(senderEmployeeId);
        message.setRecipientEmployeeId(request.recipientEmployeeId());
        message.setBody(request.body());
        return MessageResponse.from(messageRepository.save(message));
    }

    // Loading a thread also marks the other person's messages as read —
    // "opening/polling the conversation" IS the read receipt here, same as
    // opening the notification panel doesn't require a separate click.
    @Transactional
    public Page<MessageResponse> loadThread(Long employeeId, Long otherEmployeeId, Pageable pageable) {
        Page<MessageResponse> thread = messageRepository
                .findThread(employeeId, otherEmployeeId, pageable)
                .map(MessageResponse::from);
        messageRepository.markThreadRead(employeeId, otherEmployeeId);
        return thread;
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long employeeId) {
        return messageRepository.countByRecipientEmployeeIdAndReadFalse(employeeId);
    }
}