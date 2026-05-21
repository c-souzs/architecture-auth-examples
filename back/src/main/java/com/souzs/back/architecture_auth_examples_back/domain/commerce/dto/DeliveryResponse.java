package com.souzs.back.architecture_auth_examples_back.domain.commerce.dto;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.Delivery;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.DeliveryStatus;

import java.time.LocalDate;

public record DeliveryResponse(
        Long id,
        Long orderId,
        DeliveryStatus status,
        String deliveryAddress,
        String trackingCode,
        LocalDate estimatedDelivery
) {

    public static DeliveryResponse from(Delivery delivery) {
        return new DeliveryResponse(
                delivery.getId(),
                delivery.getOrder().getId(),
                delivery.getStatus(),
                delivery.getDeliveryAddress(),
                delivery.getTrackingCode(),
                delivery.getEstimatedDelivery()
        );
    }
}
