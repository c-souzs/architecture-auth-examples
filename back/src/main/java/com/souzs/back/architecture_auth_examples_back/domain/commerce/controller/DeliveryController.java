package com.souzs.back.architecture_auth_examples_back.domain.commerce.controller;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.DeliveryResponse;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.DeliveryShipRequest;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders/{orderId}/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    public DeliveryResponse findByOrderId(@PathVariable Long orderId) {
        return deliveryService.findByOrderId(orderId);
    }

    @PostMapping("/ship")
    public DeliveryResponse ship(
            @PathVariable Long orderId,
            @Valid @RequestBody DeliveryShipRequest request) {
        return deliveryService.ship(orderId, request);
    }

    @PostMapping("/deliver")
    public DeliveryResponse deliver(@PathVariable Long orderId) {
        return deliveryService.deliver(orderId);
    }
}
