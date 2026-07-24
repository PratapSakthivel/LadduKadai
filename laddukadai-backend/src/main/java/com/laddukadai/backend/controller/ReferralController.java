package com.laddukadai.backend.controller;

import com.laddukadai.backend.dto.*;
import com.laddukadai.backend.service.ReferralService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @GetMapping("/my-stats")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReferralStatsResponse> getMyReferralStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String customerEmail = auth.getName();
        return ResponseEntity.ok(referralService.getMyReferralStats(customerEmail));
    }

    @GetMapping("/my-rewards")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RewardResponse>> getMyRewards() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String customerEmail = auth.getName();
        return ResponseEntity.ok(referralService.getMyRewards(customerEmail));
    }

    @PostMapping("/apply-reward")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RewardResponse> applyRewardToOrder(
            @RequestParam Long rewardId,
            @RequestParam Long orderId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String customerEmail = auth.getName();
        return ResponseEntity.ok(referralService.applyRewardToOrder(rewardId, orderId, customerEmail));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<ReferralResponse>> getAllReferrals() {
        return ResponseEntity.ok(referralService.getAllReferrals());
    }

    @GetMapping("/leaderboard")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<ReferralStatsResponse>> getReferralLeaderboard() {
        return ResponseEntity.ok(referralService.getReferralLeaderboard());
    }
}
