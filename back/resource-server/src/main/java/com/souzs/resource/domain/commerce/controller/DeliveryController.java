package com.souzs.resource.domain.commerce.controller;

import com.souzs.resource.domain.commerce.dto.DeliveryResponse;
import com.souzs.resource.domain.commerce.dto.DeliveryShipRequest;
import com.souzs.resource.domain.commerce.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders/{orderId}/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    @PreAuthorize("hasAuthority('delivery:read')")
    public DeliveryResponse findByOrderId(@PathVariable Long orderId) {
        return deliveryService.findByOrderId(orderId);
    }

    @PostMapping("/ship")
    @PreAuthorize("hasAuthority('delivery:manage')")
    public DeliveryResponse ship(
            @PathVariable Long orderId,
            @Valid @RequestBody DeliveryShipRequest request) {
        return deliveryService.ship(orderId, request);
    }

    @PostMapping("/deliver")
    @PreAuthorize("hasAuthority('delivery:manage')")
    public DeliveryResponse deliver(@PathVariable Long orderId) {
        return deliveryService.deliver(orderId);
    }
}
