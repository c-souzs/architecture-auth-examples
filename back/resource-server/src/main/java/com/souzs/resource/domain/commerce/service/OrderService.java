package com.souzs.resource.domain.commerce.service;

import com.souzs.resource.domain.catalog.entity.Product;
import com.souzs.resource.domain.catalog.entity.ProductStatus;
import com.souzs.resource.domain.catalog.repository.ProductRepository;
import com.souzs.resource.domain.commerce.dto.OrderItemRequest;
import com.souzs.resource.domain.commerce.dto.OrderRequest;
import com.souzs.resource.domain.commerce.dto.OrderResponse;
import com.souzs.resource.domain.commerce.entity.*;
import com.souzs.resource.domain.commerce.repository.OrderRepository;
import com.souzs.resource.domain.customer.entity.Address;
import com.souzs.resource.domain.customer.entity.Customer;
import com.souzs.resource.domain.customer.repository.AddressRepository;
import com.souzs.resource.domain.customer.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private static final Set<OrderStatus> CANCELLABLE = Set.of(OrderStatus.PENDING, OrderStatus.PAYMENT_CONFIRMED);

    private static final Set<OrderStatus> ADVANCEABLE = Set.of(
            OrderStatus.PAYMENT_CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED
    );

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<OrderResponse> findAll(Long customerId, OrderStatus status) {
        if (customerId != null && status != null) {
            return orderRepository.findAllByCustomerIdAndStatus(customerId, status).stream()
                    .map(OrderResponse::from).toList();
        }
        if (customerId != null) {
            return orderRepository.findAllByCustomerId(customerId).stream()
                    .map(OrderResponse::from).toList();
        }
        if (status != null) {
            return orderRepository.findAllByStatus(status).stream()
                    .map(OrderResponse::from).toList();
        }
        return orderRepository.findAll().stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(Long id) {
        return orderRepository.findById(id)
                .map(OrderResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado: " + id));
    }

    public OrderResponse create(OrderRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer não encontrado: " + request.customerId()));

        Address address = addressRepository.findById(request.deliveryAddressId())
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado: " + request.deliveryAddressId()));

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Endereço não pertence ao customer informado");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);

        for (OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + itemReq.productId()));

            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new IllegalStateException("Produto indisponível para venda: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());
            item.setUnitPrice(product.getPrice());
            order.getItems().add(item);
        }

        BigDecimal total = order.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);

        Delivery delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setDeliveryAddress(formatAddress(address));
        order.setDelivery(delivery);

        return OrderResponse.from(orderRepository.save(order));
    }

    public OrderResponse cancel(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado: " + id));

        if (!CANCELLABLE.contains(order.getStatus())) {
            throw new IllegalStateException("Pedido não pode ser cancelado no status: " + order.getStatus());
        }

        if (order.getStatus() == OrderStatus.PAYMENT_CONFIRMED && order.getPayment() != null) {
            order.getPayment().setStatus(PaymentStatus.REFUNDED);
        }

        order.setStatus(OrderStatus.CANCELLED);
        return OrderResponse.from(order);
    }

    public OrderResponse advance(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado: " + id));

        if (!ADVANCEABLE.contains(order.getStatus())) {
            throw new IllegalStateException("Pedido não pode ser avançado no status: " + order.getStatus());
        }

        order.setStatus(nextStatus(order.getStatus()));
        return OrderResponse.from(order);
    }

    public OrderResponse refund(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado: " + id));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Estorno só permitido em pedidos com status DELIVERED");
        }

        if (order.getPayment() != null) {
            order.getPayment().setStatus(PaymentStatus.REFUNDED);
        }

        order.setStatus(OrderStatus.REFUNDED);
        return OrderResponse.from(order);
    }

    private OrderStatus nextStatus(OrderStatus current) {
        return switch (current) {
            case PAYMENT_CONFIRMED -> OrderStatus.PROCESSING;
            case PROCESSING -> OrderStatus.SHIPPED;
            case SHIPPED -> OrderStatus.DELIVERED;
            default -> throw new IllegalStateException("Transição inválida a partir de: " + current);
        };
    }

    private String formatAddress(Address a) {
        StringBuilder sb = new StringBuilder();
        sb.append(a.getStreet()).append(", ").append(a.getNumber());
        if (a.getComplement() != null && !a.getComplement().isBlank()) {
            sb.append(", ").append(a.getComplement());
        }
        sb.append(" - ").append(a.getCity()).append("/").append(a.getState());
        sb.append(" - CEP: ").append(a.getZipCode());
        return sb.toString();
    }
}
