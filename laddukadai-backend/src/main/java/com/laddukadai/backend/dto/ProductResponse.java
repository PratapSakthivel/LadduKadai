package com.laddukadai.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private BigDecimal pricePerKg;
    private BigDecimal stockKg;
    private Boolean isAvailable;
    private String imageUrl;
    private String description;
    private Timestamp createdAt;
}
