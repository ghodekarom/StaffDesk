package com.staffdesk.ems.auth.controller;

import com.staffdesk.ems.auth.dto.LoginRequest;
import com.staffdesk.ems.auth.dto.LoginResponse;
import com.staffdesk.ems.auth.dto.RefreshRequest;
import com.staffdesk.ems.auth.dto.RegisterRequest;
import com.staffdesk.ems.auth.dto.UserResponse;
import com.staffdesk.ems.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    // TODO: bootstrap-only workaround, same pattern as the employees-endpoint TODO this
    // module replaces. This is reachable without a token today because SecurityConfig
    // permits all of /api/v1/auth/**, and registration creates login credentials for an
    // existing employee -- so it should really be ADMIN-only. That's a chicken-and-egg
    // problem before any ADMIN account exists. Once one ADMIN user has been seeded
    // (e.g. a Flyway migration inserting a bcrypt hash directly into `users`), narrow
    // SecurityConfig's matcher to just "/api/v1/auth/login" + "/api/v1/auth/refresh"
    // and add @PreAuthorize("hasRole('ADMIN')") here.
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
}
