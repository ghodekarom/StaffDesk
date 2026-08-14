package com.staffdesk.ems.auth.controller;

import com.staffdesk.ems.auth.dto.ChangePasswordRequest;
import com.staffdesk.ems.auth.dto.LoginRequest;
import com.staffdesk.ems.auth.dto.LoginResponse;
import com.staffdesk.ems.auth.dto.RefreshRequest;
import com.staffdesk.ems.auth.dto.RegisterRequest;
import com.staffdesk.ems.auth.dto.UserResponse;
import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    // Restricted to ADMIN. The bootstrap chicken-and-egg problem this previously worked
    // around no longer applies -- the first ADMIN account is seeded directly via Flyway
    // (V2__seed_data.sql / V4__phase1_schema.sql), so an ADMIN always exists to call this.
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    // No @PreAuthorize role restriction -- any authenticated user (of any role) can
    // change their own password. SecurityConfig's anyRequest().authenticated() already
    // requires a valid JWT to reach this point; UserPrincipal#getId() scopes the change
    // to the caller's own account, so there's no separate ownership check needed.
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        authService.changePassword(principal.getId(), request);
        return ResponseEntity.noContent().build();
    }
}