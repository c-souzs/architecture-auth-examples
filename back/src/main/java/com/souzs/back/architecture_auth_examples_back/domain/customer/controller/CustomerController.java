package com.souzs.back.architecture_auth_examples_back.domain.customer.controller;

import com.souzs.back.architecture_auth_examples_back.domain.customer.dto.CustomerRequest;
import com.souzs.back.architecture_auth_examples_back.domain.customer.dto.CustomerResponse;
import com.souzs.back.architecture_auth_examples_back.domain.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAuthority('customer:read')")
    public List<CustomerResponse> findAll() {
        return customerService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('customer:read')")
    public CustomerResponse findById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('customer:read')")
    public CustomerResponse findByUserId(@PathVariable Long userId) {
        return customerService.findByUserId(userId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('customer:write')")
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('customer:write')")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return customerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('customer:delete')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
