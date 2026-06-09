package com.souzs.resource.domain.commerce.controller;

import com.souzs.resource.domain.commerce.dto.OrderOwnRequest;
import com.souzs.resource.domain.commerce.dto.OrderRequest;
import com.souzs.resource.domain.commerce.dto.OrderResponse;
import com.souzs.resource.domain.commerce.entity.OrderStatus;
import com.souzs.resource.domain.commerce.service.OrderService;
import com.souzs.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('order:own')")
    public List<OrderResponse> findMyOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) OrderStatus status) {
        return orderService.findMyOrders(principal.userId(), status);
    }

    @GetMapping("/my/{id}")
    @PreAuthorize("hasAuthority('order:own')")
    public OrderResponse findMyById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return orderService.findMyById(principal.userId(), id);
    }

    @PostMapping("/my")
    @PreAuthorize("hasAuthority('order:own')")
    public ResponseEntity<OrderResponse> createOwn(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderOwnRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOwn(principal.userId(), request));
    }

    @PostMapping("/my/{id}/cancel")
    @PreAuthorize("hasAuthority('order:own')")
    public OrderResponse cancelOwn(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return orderService.cancelOwn(principal.userId(), id);
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
}
