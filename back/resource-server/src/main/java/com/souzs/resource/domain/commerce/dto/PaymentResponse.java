package com.souzs.resource.domain.commerce.dto;

import com.souzs.resource.domain.commerce.entity.Payment;
import com.souzs.resource.domain.commerce.entity.PaymentMethod;
import com.souzs.resource.domain.commerce.entity.PaymentStatus;

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
