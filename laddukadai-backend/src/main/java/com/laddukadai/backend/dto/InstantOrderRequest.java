package com.laddukadai.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstantOrderRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private BigDecimal quantityKg;

    @NotBlank
    private String deliveryAddress;
}
