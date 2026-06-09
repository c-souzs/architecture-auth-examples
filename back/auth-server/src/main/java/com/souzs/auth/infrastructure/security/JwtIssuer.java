package com.souzs.auth.infrastructure.security;

import com.souzs.auth.domain.entity.User;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Component
public class JwtIssuer {

    private final RSAPrivateKey privateKey;

    @Value("${jwt.expiration-ms:900000}")
    private long expirationMs;

    public JwtIssuer(RSAPrivateKey privateKey) {
        this.privateKey = privateKey;
    }

    public String issue(User user) {
        Instant now = Instant.now();

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .toList();

        List<String> authorities = user.getRoles().stream()
                .flatMap(role -> role.getAuthorities().stream())
                .map(authority -> authority.getName())
                .distinct()
                .toList();

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("roles", roles)
                .claim("authorities", authorities)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(privateKey)
                .compact();
    }
}
