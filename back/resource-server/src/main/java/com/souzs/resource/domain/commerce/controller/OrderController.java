package com.souzs.resource.domain.commerce.controller;

import com.souzs.auth.architecture_auth_examples_back.domain.commerce.dto.OrderRequest;
import com.souzs.auth.architecture_auth_examples_back.domain.commerce.dto.OrderResponse;
import com.souzs.auth.architecture_auth_examples_back.domain.commerce.entity.OrderStatus;
import com.souzs.auth.architecture_auth_examples_back.domain.commerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<OrderResponse> findAll(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) OrderStatus status) {
        return orderService.findAll(customerId, status);
    }

    @GetMapping("/{id}")
    public OrderResponse findById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(request));
    }

    @PostMapping("/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id) {
        return orderService.cancel(id);
    }

    @PostMapping("/{id}/advance")
    public OrderResponse advance(@PathVariable Long id) {
        return orderService.advance(id);
    }

    @PostMapping("/{id}/refund")
    public OrderResponse refund(@PathVariable Long id) {
        return orderService.refund(id);
    }
}
