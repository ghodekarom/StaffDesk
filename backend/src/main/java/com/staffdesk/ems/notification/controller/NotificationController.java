package com.staffdesk.ems.notification.controller;

import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.notification.dto.NotificationResponse;
import com.staffdesk.ems.notification.dto.UnreadCountResponse;
import com.staffdesk.ems.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                notificationService.listForEmployee(principal.getEmployeeId(), withDefaultSort(pageable)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> unreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(new UnreadCountResponse(notificationService.unreadCount(principal.getEmployeeId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        notificationService.markRead(principal.getEmployeeId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllRead(principal.getEmployeeId());
        return ResponseEntity.noContent().build();
    }

    // Same helper as LeaveController — apply createdAt desc only if the
    // caller didn't already specify a sort.
    private Pageable withDefaultSort(Pageable pageable) {
        if (pageable.getSort().isSorted()) {
            return pageable;
        }
        return pageable instanceof PageRequest pr
                ? pr.withSort(Sort.by(Sort.Direction.DESC, "createdAt"))
                : pageable;
    }
}