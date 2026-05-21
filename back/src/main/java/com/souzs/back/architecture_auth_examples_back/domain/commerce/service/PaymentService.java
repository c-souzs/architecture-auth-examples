package com.souzs.back.architecture_auth_examples_back.domain.commerce.service;

import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.PaymentRequest;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.dto.PaymentResponse;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.Order;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.OrderStatus;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.Payment;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.entity.PaymentStatus;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.repository.OrderRepository;
import com.souzs.back.architecture_auth_examples_back.domain.commerce.repository.PaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public PaymentResponse findByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .map(PaymentResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Pagamento não encontrado para pedido: " + orderId));
    }

    // Mocked: confirma pagamento e avança status do pedido
    public PaymentResponse confirm(Long orderId, PaymentRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Pagamento só pode ser confirmado em pedidos com status PENDING");
        }

        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalStateException("Pedido já possui um pagamento registrado");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setStatus(PaymentStatus.CONFIRMED);
        payment.setMethod(request.method());
        payment.setAmount(order.getTotalAmount());
        payment.setTransactionId(request.transactionId());
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.PAYMENT_CONFIRMED);

        return PaymentResponse.from(payment);
    }
}
