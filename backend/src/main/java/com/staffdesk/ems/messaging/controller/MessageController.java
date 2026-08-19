package com.staffdesk.ems.messaging.controller;

import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.messaging.dto.MessageResponse;
import com.staffdesk.ems.messaging.dto.SendMessageRequest;
import com.staffdesk.ems.messaging.dto.ThreadSummaryResponse;
import com.staffdesk.ems.messaging.dto.UnreadMessageCountResponse;
import com.staffdesk.ems.messaging.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // The inbox list — one row per conversation partner. Deliberately
    // declared before /thread/{employeeId} isn't a routing concern here
    // since Spring matches literal segments before path variables, but kept
    // as a distinct top-level path so it reads clearly as "all threads"
    // rather than "a thread belonging to some id".
    @GetMapping("/threads")
    public ResponseEntity<List<ThreadSummaryResponse>> threads(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(messageService.listThreads(principal.getEmployeeId()));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> send(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(messageService.send(principal.getEmployeeId(), request));
    }

    // A "thread" with employeeId is just every message between the caller
    // and that one other employee — see MessageRepository.findThread.
    @GetMapping("/thread/{employeeId}")
    public ResponseEntity<Page<MessageResponse>> thread(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long employeeId,
            @PageableDefault(size = 30) Pageable pageable) {
        return ResponseEntity.ok(
                messageService.loadThread(principal.getEmployeeId(), employeeId, withDefaultSort(pageable)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadMessageCountResponse> unreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(new UnreadMessageCountResponse(messageService.unreadCount(principal.getEmployeeId())));
    }

    // Same helper as NotificationController/LeaveController — default to
    // newest-first only if the caller didn't already specify a sort.
    private Pageable withDefaultSort(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable;
        }
        return pageable instanceof PageRequest pr
                ? pr.withSort(Sort.by(Sort.Direction.DESC, "createdAt"))
                : pageable;
    }
}