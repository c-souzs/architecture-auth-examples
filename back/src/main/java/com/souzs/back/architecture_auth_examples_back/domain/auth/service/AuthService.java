package com.souzs.back.architecture_auth_examples_back.domain.auth.service;

import com.souzs.back.architecture_auth_examples_back.domain.auth.dto.*;
import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.RefreshToken;
import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.Role;
import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.RoleName;
import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.User;
import com.souzs.back.architecture_auth_examples_back.domain.auth.repository.RefreshTokenRepository;
import com.souzs.back.architecture_auth_examples_back.domain.auth.repository.RoleRepository;
import com.souzs.back.architecture_auth_examples_back.domain.auth.repository.UserRepository;
import com.souzs.back.architecture_auth_examples_back.infrastructure.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    static final String COOKIE_NAME = "refresh_token";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    public LoginResponse register(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("Email já cadastrado");
        }

        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER.name())
                .orElseThrow(() -> new IllegalStateException("Role CUSTOMER não encontrada"));

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        user.getRoles().add(customerRole);
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        issueRefreshToken(user, UUID.randomUUID(), response);

        return new LoginResponse(accessToken, buildUserInfo(user));
    }

    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.email())
                // Se o poptional retornado for valido, segue a funcao
                // se nao for, chega vazio no orElseThrow.
                // Evita enumeracao de usuarios por email, etc...
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!user.isEnabled() || user.isLocked()) {
            throw new BadCredentialsException("Conta desativada ou bloqueada");
        }

        String accessToken = jwtService.generateToken(user);
        issueRefreshToken(user, UUID.randomUUID(), response);

        return new LoginResponse(accessToken, buildUserInfo(user));
    }

    public RefreshResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = extractRefreshTokenCookie(request)
                .orElseThrow(() -> new BadCredentialsException("Refresh token ausente"));

        String tokenHash = sha256Hex(rawToken);

        RefreshToken stored = refreshTokenRepository.findByTokenHashForUpdate(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido"));

        if (stored.isRevoked()) {
            throw new BadCredentialsException("Refresh token revogado");
        }

        if (stored.isUsed()) {
            // Token reuse detectado — toda a família é comprometida
            refreshTokenRepository.revokeAllByFamily(stored.getFamily());
            clearRefreshTokenCookie(response);
            throw new BadCredentialsException("Reuso de refresh token detectado");
        }

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevoked(true);
            clearRefreshTokenCookie(response);
            throw new BadCredentialsException("Refresh token expirado");
        }

        stored.setUsed(true);

        User user = stored.getUser();
        String accessToken = jwtService.generateToken(user);
        issueRefreshToken(user, stored.getFamily(), response);

        return new RefreshResponse(accessToken);
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        extractRefreshTokenCookie(request).ifPresent(rawToken -> {
            String tokenHash = sha256Hex(rawToken);
            refreshTokenRepository.findByTokenHashForUpdate(tokenHash)
                    .ifPresent(stored -> refreshTokenRepository.revokeAllByUser(stored.getUser().getId()));
        });
        clearRefreshTokenCookie(response);
    }

    private void issueRefreshToken(User user, UUID family, HttpServletResponse response) {
        byte[] rawBytes = new byte[32];
        new SecureRandom().nextBytes(rawBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(rawBytes);

        RefreshToken rt = new RefreshToken();
        rt.setTokenHash(sha256Hex(rawToken));
        rt.setUser(user);
        rt.setFamily(family);
        rt.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        refreshTokenRepository.save(rt);

        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, rawToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/auth")
                .maxAge(refreshExpirationMs / 1000)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private Optional<String> extractRefreshTokenCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();
        return Arrays.stream(cookies)
                .filter(c -> COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private UserInfo buildUserInfo(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();
        List<String> authorities = user.getRoles().stream()
                .flatMap(r -> r.getAuthorities().stream())
                .map(a -> a.getName())
                .distinct()
                .toList();
        return new UserInfo(user.getId(), user.getEmail(), user.getName(), roles, authorities);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não disponível", e);
        }
    }
}
