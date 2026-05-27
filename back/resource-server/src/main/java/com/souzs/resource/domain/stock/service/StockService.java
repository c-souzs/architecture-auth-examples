package com.souzs.resource.domain.stock.service;

import com.souzs.auth.architecture_auth_examples_back.domain.stock.dto.StockAdjustRequest;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.dto.StockResponse;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.dto.StockValidateRequest;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.entity.Stock;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.entity.StockStatus;
import com.souzs.resource.domain.stock.repository.StockRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StockService {

    private final StockRepository stockRepository;

    @Transactional(readOnly = true)
    public List<StockResponse> findAll(StockStatus status) {
        if (status != null) {
            return stockRepository.findAllByStatus(status).stream()
                    .map(StockResponse::from)
                    .toList();
        }
        return stockRepository.findAll().stream()
                .map(StockResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public StockResponse findById(Long id) {
        return stockRepository.findById(id)
                .map(StockResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Estoque não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public StockResponse findByProductId(Long productId) {
        return stockRepository.findByProductId(productId)
                .map(StockResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Estoque não encontrado para produto: " + productId));
    }

    // STOCK_MANAGER define quantidade de referência e solicita nova contagem
    public StockResponse adjust(Long id, StockAdjustRequest request) {
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Estoque não encontrado: " + id));

        stock.setQuantity(request.quantity());
        stock.setMinQuantity(request.minQuantity());
        stock.setStatus(StockStatus.PENDING_COUNT);
        return StockResponse.from(stock);
    }

    // STOCK_MANAGER resolve divergência após conferência manual
    public StockResponse validate(Long id, StockValidateRequest request) {
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Estoque não encontrado: " + id));

        if (stock.getStatus() != StockStatus.DIVERGENT) {
            throw new IllegalStateException("Validação só permitida em estoques com status DIVERGENT");
        }

        stock.setQuantity(request.resolvedQuantity());
        stock.setStatus(resolveStatus(request.resolvedQuantity(), stock.getMinQuantity()));
        return StockResponse.from(stock);
    }

    static StockStatus resolveStatus(int quantity, int minQuantity) {
        return quantity < minQuantity ? StockStatus.LOW_STOCK : StockStatus.REGULAR;
    }
}
