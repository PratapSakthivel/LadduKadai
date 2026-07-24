package com.laddukadai.backend.dto;

import com.laddukadai.backend.model.RewardStatus;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardResponse {

    private Long id;
    private String customerName;
    private Integer grams;
    private String reason;
    private RewardStatus status;
    private Long appliedToOrderId;
    private Timestamp createdAt;
}
