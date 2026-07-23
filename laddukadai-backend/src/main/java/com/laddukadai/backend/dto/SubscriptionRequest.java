package com.laddukadai.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private BigDecimal quantityKg;

    @NotNull
    @Min(value = 7, message = "Minimum delivery frequency is 7 days")
    private Integer frequencyDays;

    @NotNull
    private LocalDate firstDeliveryDate;

    @NotBlank
    private String deliveryAddress;
}
