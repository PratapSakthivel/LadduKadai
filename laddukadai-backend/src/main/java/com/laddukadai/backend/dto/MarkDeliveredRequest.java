package com.laddukadai.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkDeliveredRequest {

    @NotNull
    @Positive
    private BigDecimal cashCollected;

    private String notes;
}
