package com.souzs.resource.domain.customer.service;

import com.souzs.resource.domain.customer.dto.CustomerRequest;
import com.souzs.resource.domain.customer.dto.CustomerResponse;
import com.souzs.resource.domain.customer.entity.Customer;
import com.souzs.resource.domain.customer.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<CustomerResponse> findAll() {
        return customerRepository.findAll().stream()
                .map(CustomerResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        return customerRepository.findById(id)
                .map(CustomerResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Customer não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public CustomerResponse findByUserId(Long userId) {
        return customerRepository.findByUserId(userId)
                .map(CustomerResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Customer não encontrado para userId: " + userId));
    }

    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByCpf(request.cpf())) {
            throw new IllegalStateException("CPF já cadastrado: " + request.cpf());
        }
        if (customerRepository.findByUserId(request.userId()).isPresent()) {
            throw new IllegalStateException("Usuário já possui um customer vinculado");
        }
        Customer customer = new Customer();
        customer.setUserId(request.userId());
        customer.setCpf(request.cpf());
        customer.setPhone(request.phone());
        return CustomerResponse.from(customerRepository.save(customer));
    }

    // CPF é imutável após criação — apenas phone é atualizável
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer não encontrado: " + id));
        customer.setPhone(request.phone());
        return CustomerResponse.from(customer);
    }

    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new EntityNotFoundException("Customer não encontrado: " + id);
        }
        customerRepository.deleteById(id);
    }
}
