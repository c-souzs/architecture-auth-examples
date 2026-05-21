package com.souzs.back.architecture_auth_examples_back.domain.customer.dto;

import com.souzs.back.architecture_auth_examples_back.domain.customer.entity.Customer;

public record CustomerResponse(
        Long id,
        String cpf,
        String phone,
        Long userId,
        String userName,
        String userEmail
) {

    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getCpf(),
                customer.getPhone(),
                customer.getUser().getId(),
                customer.getUser().getName(),
                customer.getUser().getEmail()
        );
    }
}
