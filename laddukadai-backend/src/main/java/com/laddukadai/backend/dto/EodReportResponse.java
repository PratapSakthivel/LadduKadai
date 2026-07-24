package com.laddukadai.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EodReportResponse {

    private Long id;
    private String deliveryManName;
    private LocalDate reportDate;
    private BigDecimal totalCash;
    private Integer totalDeliveries;
    private Integer totalNotHome;
    private Integer totalRejected;
    private Boolean isVerified;
    private Timestamp submittedAt;
}
