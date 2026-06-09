package com.souzs.resource.domain.stock.controller;

import com.souzs.resource.domain.stock.dto.StockCountRequest;
import com.souzs.resource.domain.stock.dto.StockCountResponse;
import com.souzs.resource.domain.stock.service.StockCountService;
import com.souzs.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StockCountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stockCountService.submit(stockId, principal.userId(), request));
    }
}
