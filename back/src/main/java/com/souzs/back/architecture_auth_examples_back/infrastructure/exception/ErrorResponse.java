package com.souzs.back.architecture_auth_examples_back.infrastructure.exception;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> errors
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, path, null);
    }

    public static ErrorResponse ofValidation(int status, String error, String message, String path, Map<String, String> errors) {
        return new ErrorResponse(Instant.now(), status, error, message, path, errors);
    }
}
