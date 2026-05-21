package com.souzs.back.architecture_auth_examples_back.domain.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(

        @NotBlank @Size(max = 200)
        String street,

        @NotBlank @Size(max = 10)
        String number,

        @Size(max = 100)
        String complement,

        @NotBlank @Size(max = 100)
        String city,

        @NotBlank @Pattern(regexp = "[A-Z]{2}", message = "Estado deve ser a sigla de 2 letras maiúsculas")
        String state,

        @NotBlank @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 dígitos numéricos")
        String zipCode
) {}
