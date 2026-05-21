package com.souzs.back.architecture_auth_examples_back.domain.commerce.dto;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.Payment;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.PaymentMethod;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.PaymentStatus;

import java.math.BigDecimal;

public record PaymentResponse(
        Long id,
        Long orderId,
        PaymentStatus status,
        PaymentMethod method,
        BigDecimal amount,
        String transactionId
) {

    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getStatus(),
                payment.getMethod(),
                payment.getAmount(),
                payment.getTransactionId()
        );
    }
}
