package com.laddukadai.backend.dto;

import com.laddukadai.backend.model.SubscriptionStatus;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponse {

    private Long id;
    private String customerName;
    private String customerEmail;
    private String productName;
    private BigDecimal pricePerKg;
    private BigDecimal quantityKg;
    private Integer frequencyDays;
    private LocalDate nextDeliveryDate;
    private SubscriptionStatus status;
    private LocalDate pausedUntil;
    private String deliveryAddress;
    private BigDecimal totalAmountPerDelivery;
    private Timestamp createdAt;
}
