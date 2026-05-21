package com.souzs.back.architecture_auth_examples_back.domain.commerce.dto;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.Order;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        Long customerId,
        String customerName,
        OrderStatus status,
        BigDecimal totalAmount,
        Instant createdAt,
        List<OrderItemResponse> items,
        PaymentResponse payment,
        DeliveryResponse delivery
) {

    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getCustomer().getUser().getName(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getItems().stream().map(OrderItemResponse::from).toList(),
                order.getPayment() != null ? PaymentResponse.from(order.getPayment()) : null,
                order.getDelivery() != null ? DeliveryResponse.from(order.getDelivery()) : null
        );
    }
}
