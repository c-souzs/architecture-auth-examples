package com.souzs.resource.domain.customer.dto;

import com.souzs.resource.domain.customer.entity.Address;

public record AddressResponse(
        Long id,
        Long customerId,
        String street,
        String number,
        String complement,
        String city,
        String state,
        String zipCode
) {

    public static AddressResponse from(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getCustomer().getId(),
                address.getStreet(),
                address.getNumber(),
                address.getComplement(),
                address.getCity(),
                address.getState(),
                address.getZipCode()
        );
    }
}
