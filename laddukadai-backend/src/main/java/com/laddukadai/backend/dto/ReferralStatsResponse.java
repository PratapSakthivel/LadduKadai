package com.laddukadai.backend.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralStatsResponse {

    private String referralCode;
    private String referralLink;
    private long totalReferrals;
    private long confirmedReferrals;
    private long pendingReferrals;
    private List<RewardResponse> pendingRewards;
}
