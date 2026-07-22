package com.laddukadai.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKg;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal stockKg = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "is_available")
    private Boolean isAvailable = true;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(updatable = false)
    private Timestamp createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Timestamp.from(Instant.now());
    }
}
