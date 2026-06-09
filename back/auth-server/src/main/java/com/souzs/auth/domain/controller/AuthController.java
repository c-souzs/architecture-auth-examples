package com.souzs.auth.domain.controller;

import com.souzs.auth.domain.dto.LoginRequest;
import com.souzs.auth.domain.dto.LoginResponse;
import com.souzs.auth.domain.dto.RegisterRequest;
import com.souzs.auth.domain.dto.UserInfo;
import com.souzs.auth.domain.service.AuthService;
import com.souzs.shared.security.UserPrincipal;
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
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logout();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserInfo me(@AuthenticationPrincipal UserPrincipal principal) {
        return UserInfo.from(principal);
    }
}
