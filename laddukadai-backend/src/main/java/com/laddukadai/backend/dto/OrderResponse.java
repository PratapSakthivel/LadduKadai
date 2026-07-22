package com.laddukadai.backend.dto;

import com.laddukadai.backend.model.OrderStatus;
import com.laddukadai.backend.model.OrderType;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String productName;
    private BigDecimal pricePerKg;
    private BigDecimal quantityKg;

    private OrderType orderType;
    private OrderStatus status;

    private BigDecimal totalAmount;
    private String deliveryAddress;

    private LocalDate deliveryDate;
    private String deliveryManName;

    private Timestamp createdAt;
}
