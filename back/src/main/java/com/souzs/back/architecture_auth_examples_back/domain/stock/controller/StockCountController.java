package com.souzs.back.architecture_auth_examples_back.domain.stock.controller;

import com.souzs.back.architecture_auth_examples_back.domain.stock.dto.StockCountRequest;
import com.souzs.back.architecture_auth_examples_back.domain.stock.dto.StockCountResponse;
import com.souzs.back.architecture_auth_examples_back.domain.stock.service.StockCountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stocks/{stockId}/counts")
@RequiredArgsConstructor
public class StockCountController {

    private final StockCountService stockCountService;

    @GetMapping
    @PreAuthorize("hasAuthority('stock:read')")
    public List<StockCountResponse> findAllByStock(@PathVariable Long stockId) {
        return stockCountService.findAllByStock(stockId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('stock:count')")
    public ResponseEntity<StockCountResponse> submit(
            @PathVariable Long stockId,
            @Valid @RequestBody StockCountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockCountService.submit(stockId, request));
    }
}
