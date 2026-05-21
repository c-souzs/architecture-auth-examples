package com.souzs.back.architecture_auth_examples_back.domain.commerce.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record DeliveryShipRequest(

        @NotBlank
        String trackingCode,

        @NotNull @Future
        LocalDate estimatedDelivery
) {}
