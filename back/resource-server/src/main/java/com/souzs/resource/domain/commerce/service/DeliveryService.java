package com.souzs.resource.domain.commerce.service;

import com.souzs.auth.architecture_auth_examples_back.domain.commerce.dto.DeliveryResponse;
import com.souzs.auth.architecture_auth_examples_back.domain.commerce.dto.DeliveryShipRequest;
import com.souzs.auth.architecture_auth_examples_back.domain.commerce.entity.Delivery;
import com.souzs.auth.architecture_auth_examples_back.domain.commerce.entity.DeliveryStatus;
import com.souzs.auth.architecture_auth_examples_back.domain.commerce.entity.OrderStatus;
import com.souzs.resource.domain.commerce.repository.DeliveryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    @Transactional(readOnly = true)
    public DeliveryResponse findByOrderId(Long orderId) {
        return deliveryRepository.findByOrderId(orderId)
                .map(DeliveryResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Entrega não encontrada para pedido: " + orderId));
    }

    // Mocked: registra envio com código de rastreamento
    public DeliveryResponse ship(Long orderId, DeliveryShipRequest request) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Entrega não encontrada para pedido: " + orderId));

        if (delivery.getOrder().getStatus() != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Envio só permitido em pedidos com status SHIPPED");
        }

        delivery.setStatus(DeliveryStatus.SHIPPED);
        delivery.setTrackingCode(request.trackingCode());
        delivery.setEstimatedDelivery(request.estimatedDelivery());
        return DeliveryResponse.from(delivery);
    }

    // Mocked: confirma entrega ao destinatário
    public DeliveryResponse deliver(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Entrega não encontrada para pedido: " + orderId));

        if (delivery.getOrder().getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Confirmação de entrega só permitida em pedidos com status DELIVERED");
        }

        delivery.setStatus(DeliveryStatus.DELIVERED);
        return DeliveryResponse.from(delivery);
    }
}
