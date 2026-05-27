package com.souzs.resource.domain.commerce.dto;

import com.souzs.resource.domain.commerce.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record PaymentRequest(

        @NotNull
        PaymentMethod method,

        String transactionId
) {}
