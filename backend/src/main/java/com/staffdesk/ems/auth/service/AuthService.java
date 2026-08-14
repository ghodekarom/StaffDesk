package com.staffdesk.ems.auth.service;

import com.staffdesk.ems.auth.dto.ChangePasswordRequest;
import com.staffdesk.ems.auth.dto.LoginRequest;
import com.staffdesk.ems.auth.dto.LoginResponse;
import com.staffdesk.ems.auth.dto.RegisterRequest;
import com.staffdesk.ems.auth.dto.UserResponse;
import com.staffdesk.ems.auth.entity.User;
import com.staffdesk.ems.auth.exception.AuthExceptions;
import com.staffdesk.ems.auth.repository.UserRepository;
import com.staffdesk.ems.auth.security.JwtService;
import com.staffdesk.ems.auth.security.UserPrincipal;
import com.staffdesk.ems.employee.entity.Employee;
import com.staffdesk.ems.employee.repository.EmployeeRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService,
                       UserRepository userRepository,
                       EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Throws BadCredentialsException (bad password) or DisabledException (inactive
        // account) on failure -- both handled by AuthExceptionHandler.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AuthExceptions.EmployeeNotFoundException(principal.getEmployeeId()));
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(principal);

        return new LoginResponse(accessToken, refreshToken, jwtService.getAccessTokenExpirationMs(),
                principal.getEmployeeId(), user.getRole());
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new AuthExceptions.EmailAlreadyExistsException(request.email());
        }
        if (userRepository.existsByEmployeeId(request.employeeId())) {
            throw new AuthExceptions.EmployeeAlreadyHasAccountException(request.employeeId());
        }

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new AuthExceptions.EmployeeNotFoundException(request.employeeId()));

        User user = new User();
        user.setEmployee(employee);
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setActive(true);

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    /**
     * @param userId the id of the currently-authenticated User row (UserPrincipal#getId(),
     *               not the employee id) — the caller can only ever change their own password.
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        // Should be unreachable in practice: userId comes from a validated JWT, so a
        // missing row here means the user was deleted between token issuance and this
        // call. Left as an unchecked 500 rather than a dedicated 4xx exception, since
        // there's nothing the caller did wrong to fix.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user " + userId + " no longer exists"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new AuthExceptions.InvalidCurrentPasswordException();
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public LoginResponse refresh(String refreshToken) {
        String email = jwtService.extractEmail(refreshToken);
        if (email == null
                || !"refresh".equals(jwtService.extractTokenType(refreshToken))
                || !jwtService.isTokenValid(refreshToken, email)) {
            throw new AuthExceptions.InvalidRefreshTokenException();
        }

        UserPrincipal principal = (UserPrincipal) userDetailsService.loadUserByUsername(email);
        if (!principal.isEnabled()) {
            throw new AuthExceptions.InvalidRefreshTokenException();
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(AuthExceptions.InvalidRefreshTokenException::new);

        String newAccessToken = jwtService.generateAccessToken(principal);
        String newRefreshToken = jwtService.generateRefreshToken(principal);

        return new LoginResponse(newAccessToken, newRefreshToken, jwtService.getAccessTokenExpirationMs(),
                principal.getEmployeeId(), user.getRole());
    }
}