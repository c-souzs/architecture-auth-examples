package com.souzs.auth.infrastructure.config;

import com.souzs.shared.security.JwtValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.security.converter.RsaKeyConverters;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.io.InputStream;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

@Configuration
public class RsaKeyConfig {

    @Value("${rsa.private-key}")
    private Resource privateKeyResource;

    @Value("${rsa.public-key}")
    private Resource publicKeyResource;

    @Bean
    public RSAPrivateKey rsaPrivateKey() throws IOException {
        try (InputStream is = privateKeyResource.getInputStream()) {
            return RsaKeyConverters.pkcs8().convert(is);
        }
    }

    @Bean
    public RSAPublicKey rsaPublicKey() throws IOException {
        try (InputStream is = publicKeyResource.getInputStream()) {
            return RsaKeyConverters.x509().convert(is);
        }
    }

    @Bean
    public JwtValidator jwtValidator(RSAPublicKey publicKey) {
        return new JwtValidator(publicKey);
    }
}
