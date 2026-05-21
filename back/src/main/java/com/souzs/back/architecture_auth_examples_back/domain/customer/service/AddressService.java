package com.souzs.back.architecture_auth_examples_back.domain.customer.service;

import com.souzs.back.architecture_auth_examples_back.domain.customer.dto.AddressRequest;
import com.souzs.back.architecture_auth_examples_back.domain.customer.dto.AddressResponse;
import com.souzs.back.architecture_auth_examples_back.domain.customer.entity.Address;
import com.souzs.back.architecture_auth_examples_back.domain.customer.entity.Customer;
import com.souzs.back.architecture_auth_examples_back.domain.customer.repository.AddressRepository;
import com.souzs.back.architecture_auth_examples_back.domain.customer.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> findAllByCustomer(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new EntityNotFoundException("Customer não encontrado: " + customerId);
        }
        return addressRepository.findAllByCustomerId(customerId).stream()
                .map(AddressResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AddressResponse findById(Long customerId, Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado: " + id));

        if (!address.getCustomer().getId().equals(customerId)) {
            throw new EntityNotFoundException("Endereço não encontrado: " + id);
        }
        return AddressResponse.from(address);
    }

    public AddressResponse create(Long customerId, AddressRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer não encontrado: " + customerId));

        Address address = new Address();
        address.setCustomer(customer);
        address.setStreet(request.street());
        address.setNumber(request.number());
        address.setComplement(request.complement());
        address.setCity(request.city());
        address.setState(request.state());
        address.setZipCode(request.zipCode());
        return AddressResponse.from(addressRepository.save(address));
    }

    public AddressResponse update(Long customerId, Long id, AddressRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado: " + id));

        if (!address.getCustomer().getId().equals(customerId)) {
            throw new EntityNotFoundException("Endereço não encontrado: " + id);
        }

        address.setStreet(request.street());
        address.setNumber(request.number());
        address.setComplement(request.complement());
        address.setCity(request.city());
        address.setState(request.state());
        address.setZipCode(request.zipCode());
        return AddressResponse.from(address);
    }

    public void delete(Long customerId, Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado: " + id));

        if (!address.getCustomer().getId().equals(customerId)) {
            throw new EntityNotFoundException("Endereço não encontrado: " + id);
        }
        addressRepository.delete(address);
    }
}
