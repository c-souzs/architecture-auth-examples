package com.souzs.shared.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import java.security.interfaces.RSAPublicKey;
import java.util.List;

// Dado um token, monta o usuario a partir dele.
// Ja faz a validacao do token, se der ruim o proprio
// parser lanca uma expcetion
public class JwtValidator {

    private final RSAPublicKey publicKey;

    public JwtValidator(RSAPublicKey publicKey) {
        this.publicKey = publicKey;
    }

    public UserPrincipal validate(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return new UserPrincipal(
                Long.parseLong(claims.getSubject()),
                claims.get("email", String.class),
                claims.get("name", String.class),
                extractList(claims, "roles"),
                extractList(claims, "authorities")
        );
    }

    @SuppressWarnings("unchecked")
    private List<String> extractList(Claims claims, String key) {
        Object value = claims.get(key);
        if (value instanceof List<?> list) {
            return (List<String>) list;
        }
        return List.of();
    }
}
