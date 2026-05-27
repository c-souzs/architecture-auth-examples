package com.souzs.resource.domain.stock.controller;

import com.souzs.auth.architecture_auth_examples_back.domain.stock.dto.StockAdjustRequest;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.dto.StockResponse;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.dto.StockValidateRequest;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.entity.StockStatus;
import com.souzs.auth.architecture_auth_examples_back.domain.stock.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    public List<StockResponse> findAll(@RequestParam(required = false) StockStatus status) {
        return stockService.findAll(status);
    }

    @GetMapping("/{id}")
    public StockResponse findById(@PathVariable Long id) {
        return stockService.findById(id);
    }

    @GetMapping("/product/{productId}")
    public StockResponse findByProductId(@PathVariable Long productId) {
        return stockService.findByProductId(productId);
    }

    @PutMapping("/{id}/adjust")
    public StockResponse adjust(@PathVariable Long id, @Valid @RequestBody StockAdjustRequest request) {
        return stockService.adjust(id, request);
    }

    @PutMapping("/{id}/validate")
    public StockResponse validate(@PathVariable Long id, @Valid @RequestBody StockValidateRequest request) {
        return stockService.validate(id, request);
    }
}
