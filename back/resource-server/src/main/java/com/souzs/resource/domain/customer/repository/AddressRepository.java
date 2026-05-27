package com.souzs.resource.domain.customer.repository;

import com.souzs.auth.architecture_auth_examples_back.domain.customer.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findAllByCustomerId(Long customerId);
}
