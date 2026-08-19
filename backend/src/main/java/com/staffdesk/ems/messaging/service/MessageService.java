package com.staffdesk.ems.messaging.service;

import com.staffdesk.ems.common.exception.ResourceNotFoundException;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import com.staffdesk.ems.messaging.dto.MessageResponse;
import com.staffdesk.ems.messaging.dto.SendMessageRequest;
import com.staffdesk.ems.messaging.dto.ThreadSummaryResponse;
import com.staffdesk.ems.messaging.entity.Message;
import com.staffdesk.ems.messaging.repository.MessageRepository;
import com.staffdesk.ems.notification.entity.Notification;
import com.staffdesk.ems.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class MessageService {

    // Notification "New message from X: <preview>" is truncated here rather
    // than showing the full body — the notification panel is a glance-and-go
    // list, not the place to read a long message; the link takes them to
    // the actual thread for that.
    private static final int PREVIEW_LENGTH = 80;

    private final MessageRepository messageRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public MessageService(MessageRepository messageRepository, EmployeeRepository employeeRepository,
                          NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public MessageResponse send(Long senderEmployeeId, SendMessageRequest request) {
        if (senderEmployeeId.equals(request.recipientEmployeeId())) {
            throw new IllegalArgumentException("Cannot send a direct message to yourself");
        }
        Employee sender = employeeRepository.findById(senderEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + senderEmployeeId));
        if (!employeeRepository.existsById(request.recipientEmployeeId())) {
            throw new ResourceNotFoundException("Employee not found: " + request.recipientEmployeeId());
        }

        Message message = new Message();
        message.setSenderEmployeeId(senderEmployeeId);
        message.setRecipientEmployeeId(request.recipientEmployeeId());
        message.setBody(request.body());
        Message saved = messageRepository.save(message);

        notificationService.notify(
                request.recipientEmployeeId(),
                Notification.Type.MESSAGE,
                "New message from " + sender.getFirstName() + " " + sender.getLastName(),
                preview(request.body()),
                "/messages/" + senderEmployeeId
        );

        return MessageResponse.from(saved);
    }

    private String preview(String body) {
        String trimmed = body.strip();
        return trimmed.length() > PREVIEW_LENGTH ? trimmed.substring(0, PREVIEW_LENGTH) + "…" : trimmed;
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

    // Inbox list: one row per conversation partner, most-recent message
    // first. Capped at the last 200 messages across all of this employee's
    // threads — plenty for grouping into partners at this app's scale
    // without a heavier GROUP BY/window-function query.
    @Transactional(readOnly = true)
    public List<ThreadSummaryResponse> listThreads(Long employeeId) {
        Page<Message> recent = messageRepository.findBySenderEmployeeIdOrRecipientEmployeeIdOrderByCreatedAtDesc(
                employeeId, employeeId, PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "createdAt")));

        // LinkedHashMap preserves "most recent partner first" as we walk the
        // already-sorted list, keeping only the first (= latest) message
        // seen per partner.
        Map<Long, Message> latestByPartner = new LinkedHashMap<>();
        for (Message m : recent.getContent()) {
            Long otherId = m.getSenderEmployeeId().equals(employeeId) ? m.getRecipientEmployeeId() : m.getSenderEmployeeId();
            latestByPartner.putIfAbsent(otherId, m);
        }

        Map<Long, Employee> employeesById = StreamSupport
                .stream(employeeRepository.findAllById(latestByPartner.keySet()).spliterator(), false)
                .collect(Collectors.toMap(Employee::getId, e -> e));

        return latestByPartner.entrySet().stream()
                .map(entry -> {
                    Long otherId = entry.getKey();
                    Message last = entry.getValue();
                    Employee other = employeesById.get(otherId);
                    String name = other != null ? other.getFirstName() + " " + other.getLastName() : "Former employee";
                    long unread = messageRepository.countByRecipientEmployeeIdAndSenderEmployeeIdAndReadFalse(employeeId, otherId);
                    return new ThreadSummaryResponse(
                            otherId, name, last.getBody(), last.getCreatedAt(),
                            last.getSenderEmployeeId().equals(employeeId), unread
                    );
                })
                .toList();
    }
}