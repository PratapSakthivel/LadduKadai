package com.laddukadai.backend.dto;

import com.laddukadai.backend.model.ReferralStatus;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralResponse {

    private Long id;
    private String referrerName;
    private String referrerEmail;
    private String referredName;
    private String referredEmail;
    private ReferralStatus status;
    private Timestamp createdAt;
}
