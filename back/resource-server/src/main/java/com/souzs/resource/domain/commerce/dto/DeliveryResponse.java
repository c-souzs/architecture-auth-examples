package com.souzs.resource.domain.commerce.dto;

import com.souzs.resource.domain.commerce.entity.Delivery;
import com.souzs.resource.domain.commerce.entity.DeliveryStatus;

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
