package com.staffdesk.ems.dashboard.controller;

import com.staffdesk.ems.auth.entity.User;
import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.dashboard.dto.DashboardSummaryResponse;
import com.staffdesk.ems.dashboard.service.DashboardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    // Same review-scope rule the Overview page already applies to
    // /leave/requests vs /leave/requests/me — kept in sync with
    // LeaveController's @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')").
    private static final Set<User.Role> REVIEW_ROLES = Set.of(User.Role.ADMIN, User.Role.HR, User.Role.MANAGER);

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // `range` powers the Overview page's period dropdown. Accepted values:
    // "today" (default), "week", "month". Anything else is treated as
    // "today" by DashboardService — never rejected with a 400, since a
    // bad/unknown value here shouldn't break the whole dashboard.
    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "range", defaultValue = "today") String range) {
        boolean canReviewTeam = REVIEW_ROLES.contains(principal.getRole());
        return dashboardService.getSummary(principal.getEmployeeId(), canReviewTeam, range);
    }
}