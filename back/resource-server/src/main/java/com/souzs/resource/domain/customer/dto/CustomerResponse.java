package com.souzs.resource.domain.customer.dto;

import com.souzs.resource.domain.customer.entity.Customer;

public record CustomerResponse(
        Long id,
        String cpf,
        String phone,
        Long userId
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getCpf(),
                customer.getPhone(),
                customer.getUserId()
        );
    }
}
