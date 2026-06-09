package com.souzs.auth.domain.service;

import com.souzs.auth.domain.dto.LoginRequest;
import com.souzs.auth.domain.dto.LoginResponse;
import com.souzs.auth.domain.dto.RegisterRequest;
import com.souzs.auth.domain.dto.UserInfo;
import com.souzs.auth.domain.entity.User;
import com.souzs.auth.domain.repository.UserRepository;
import com.souzs.auth.infrastructure.security.JwtIssuer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtIssuer jwtIssuer;

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("Email já em uso");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        User saved = userRepository.save(user);
        return new LoginResponse(jwtIssuer.issue(saved), new UserInfo(saved.getId(), saved.getEmail(), saved.getName(), List.of(), List.of()));
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        User user = userRepository.findByEmailWithRolesAndAuthorities(request.email())
                .orElseThrow();

        List<String> roles = user.getRoles().stream().map(r -> r.getName()).toList();
        List<String> authorities = user.getRoles().stream()
                .flatMap(r -> r.getAuthorities().stream())
                .map(a -> a.getName())
                .distinct()
                .toList();

        return new LoginResponse(jwtIssuer.issue(user), new UserInfo(user.getId(), user.getEmail(), user.getName(), roles, authorities));
    }

    public void logout() {
        // sem refresh token nessa branch — nada a revogar no servidor
    }
}
