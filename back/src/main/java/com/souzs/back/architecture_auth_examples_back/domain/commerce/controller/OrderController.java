package com.souzs.back.architecture_auth_examples_back.domain.commerce.controller;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.OrderOwnRequest;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.OrderRequest;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.OrderResponse;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.OrderStatus;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('order:own')")
    public List<OrderResponse> findMine(
            @RequestParam(required = false) OrderStatus status,
            Authentication authentication) {
        return orderService.findMyOrders(extractUserId(authentication), status);
    }

    @GetMapping("/my/{id}")
    @PreAuthorize("hasAuthority('order:own')")
    public OrderResponse findMineById(@PathVariable Long id, Authentication authentication) {
        return orderService.findMyById(id, extractUserId(authentication));
    }

    @PostMapping("/my")
    @PreAuthorize("hasAuthority('order:own')")
    public ResponseEntity<OrderResponse> createOwn(
            @Valid @RequestBody OrderOwnRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOwn(extractUserId(authentication), request));
    }

    @PostMapping("/my/{id}/cancel")
    @PreAuthorize("hasAuthority('order:own')")
    public OrderResponse cancelOwn(@PathVariable Long id, Authentication authentication) {
        return orderService.cancelOwn(id, extractUserId(authentication));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('order:read')")
    public List<OrderResponse> findAll(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) OrderStatus status) {
        return orderService.findAll(customerId, status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('order:read')")
    public OrderResponse findById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('order:write')")
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(request));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('order:cancel')")
    public OrderResponse cancel(@PathVariable Long id) {
        return orderService.cancel(id);
    }

    @PostMapping("/{id}/advance")
    @PreAuthorize("hasAuthority('order:manage')")
    public OrderResponse advance(@PathVariable Long id) {
        return orderService.advance(id);
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAuthority('order:manage')")
    public OrderResponse refund(@PathVariable Long id) {
        return orderService.refund(id);
    }

    private Long extractUserId(Authentication authentication) {
        return Long.parseLong((String) authentication.getPrincipal());
    }
}
