package com.souzs.back.architecture_auth_examples_back.domain.commerce.controller;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.PaymentRequest;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.PaymentResponse;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders/{orderId}/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAuthority('payment:read')")
    public PaymentResponse findByOrderId(@PathVariable Long orderId) {
        return paymentService.findByOrderId(orderId);
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasAuthority('payment:manage')")
    public ResponseEntity<PaymentResponse> confirm(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.confirm(orderId, request));
    }
}
