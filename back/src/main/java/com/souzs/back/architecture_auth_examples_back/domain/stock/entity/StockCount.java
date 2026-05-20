package com.souzs.back.architecture_auth_examples_back.domain.stock.entity;

import com.souzs.back.architecture_auth_examples_back.domain.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "stock_counts")
@Getter
@Setter
@NoArgsConstructor
public class StockCount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "counted_by_user_id", nullable = false)
    private User countedBy;

    @Column(nullable = false)
    private Integer countedQuantity;

    @Column(nullable = false, updatable = false)
    private Instant countedAt;

    @PrePersist
    protected void onCreate() {
        countedAt = Instant.now();
    }
}
