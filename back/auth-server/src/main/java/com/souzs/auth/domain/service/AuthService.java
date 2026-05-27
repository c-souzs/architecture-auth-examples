package com.souzs.auth.domain.service;

import com.souzs.auth.domain.dto.LoginRequest;
import com.souzs.auth.domain.dto.LoginResponse;
import com.souzs.auth.domain.dto.RegisterRequest;
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

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtIssuer jwtIssuer;

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("Email já em uso");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        userRepository.save(user);
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

        return new LoginResponse(jwtIssuer.issue(user));
    }

    public void logout() {
        // sem refresh token nessa branch — nada a revogar no servidor
    }
}
