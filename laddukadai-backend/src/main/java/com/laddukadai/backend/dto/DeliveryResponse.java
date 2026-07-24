package com.laddukadai.backend.dto;

import com.laddukadai.backend.model.DeliveryStatus;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryResponse {

    private Long id;
    private Long orderId;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String productName;
    private BigDecimal quantityKg;
    private BigDecimal amountToCollect;
    private DeliveryStatus status;
    private String deliveryManName;
    private LocalDateTime attemptedAt;
    private LocalDateTime deliveredAt;
    private LocalDate rescheduleDate;
    private String notes;
    private Timestamp createdAt;
}
