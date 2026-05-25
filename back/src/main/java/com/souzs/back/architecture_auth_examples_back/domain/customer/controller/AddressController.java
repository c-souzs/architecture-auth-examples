package com.souzs.back.architecture_auth_examples_back.domain.customer.controller;

import com.souzs.back.architecture_auth_examples_back.domain.customer.dto.AddressRequest;
import com.souzs.back.architecture_auth_examples_back.domain.customer.dto.AddressResponse;
import com.souzs.back.architecture_auth_examples_back.domain.customer.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers/{customerId}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @PreAuthorize("hasAuthority('customer:read')")
    public List<AddressResponse> findAll(@PathVariable Long customerId) {
        return addressService.findAllByCustomer(customerId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('customer:read')")
    public AddressResponse findById(@PathVariable Long customerId, @PathVariable Long id) {
        return addressService.findById(customerId, id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('customer:write')")
    public ResponseEntity<AddressResponse> create(
            @PathVariable Long customerId,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.create(customerId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('customer:write')")
    public AddressResponse update(
            @PathVariable Long customerId,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return addressService.update(customerId, id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('customer:delete')")
    public ResponseEntity<Void> delete(@PathVariable Long customerId, @PathVariable Long id) {
        addressService.delete(customerId, id);
        return ResponseEntity.noContent().build();
    }
}
