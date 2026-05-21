package com.souzs.back.architecture_auth_examples_back.domain.commerce.dto;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record PaymentRequest(

        @NotNull
        PaymentMethod method,

        String transactionId
) {}
