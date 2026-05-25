package com.souzs.back.architecture_auth_examples_back.domain.auth.controller;

import com.souzs.back.architecture_auth_examples_back.domain.auth.dto.*;
import com.souzs.back.architecture_auth_examples_back.domain.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request, response));
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        return authService.login(request, response);
    }

    @PostMapping("/refresh")
    public RefreshResponse refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        return authService.refresh(request, response);
    }

    @GetMapping("/me")
    public UserInfo me(@AuthenticationPrincipal String userId) {
        return authService.me(Long.parseLong(userId));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }
}
