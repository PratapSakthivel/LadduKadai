package com.laddukadai.backend.service;

import com.laddukadai.backend.dto.*;
import com.laddukadai.backend.exception.ResourceNotFoundException;
import com.laddukadai.backend.model.*;
import com.laddukadai.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final RewardRepository rewardRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @Value("${app.base-url:http://localhost:4200}")
    private String baseUrl;

    @Transactional
    public void createReferralRecord(User newUser) {
        if (newUser.getReferredBy() == null || newUser.getReferredBy().trim().isEmpty()) {
            return;
        }

        String refCode = newUser.getReferredBy().trim();
        Optional<User> referrerOpt = userRepository.findByReferralCode(refCode);

        if (referrerOpt.isEmpty()) {
            log.warn("Referrer with code {} not found for new user {}", refCode, newUser.getEmail());
            return;
        }

        User referrer = referrerOpt.get();

        // Edge Case 1: Self referral check
        if (referrer.getId().equals(newUser.getId())) {
            log.warn("Self referral detected for user {}. Skipping referral creation.", newUser.getEmail());
            return;
        }

        // Edge Case 4: Already referred by someone else
        if (referralRepository.existsByReferredId(newUser.getId())) {
            log.warn("User {} already has a referral record. Skipping.", newUser.getEmail());
            return;
        }

        Referral referral = Referral.builder()
                .referrer(referrer)
                .referred(newUser)
                .status(ReferralStatus.PENDING)
                .build();

        referralRepository.save(referral);
        log.info("Referral created: referrer={} referred={}", referrer.getEmail(), newUser.getEmail());
    }

    @Transactional
    public void confirmReferral(Long referredUserId) {
        Optional<Referral> referralOpt = referralRepository.findByReferredId(referredUserId);

        if (referralOpt.isEmpty()) {
            return;
        }

        Referral referral = referralOpt.get();

        if (referral.getStatus() == ReferralStatus.CONFIRMED) {
            log.info("Referral for referredUserId={} already CONFIRMED. Skipping.", referredUserId);
            return;
        }

        referral.setStatus(ReferralStatus.CONFIRMED);
        referralRepository.save(referral);

        User referrer = referral.getReferrer();
        int currentCount = (referrer.getReferralCount() == null ? 0 : referrer.getReferralCount()) + 1;
        referrer.setReferralCount(currentCount);
        userRepository.save(referrer);

        // Send email to referrer about confirmed referral
        emailService.sendReferralConfirmedToReferrer(
                referrer.getEmail(),
                referrer.getName(),
                referral.getReferred().getName(),
                currentCount
        );

        // Check if referralCount hits 5 (every 5 referrals)
        if (currentCount % 5 == 0) {
            Reward reward = Reward.builder()
                    .customer(referrer)
                    .grams(250)
                    .reason("5 referrals confirmed")
                    .status(RewardStatus.PENDING)
                    .build();

            rewardRepository.save(reward);
            emailService.sendReferralRewardEarnedToCustomer(
                    referrer.getEmail(),
                    referrer.getName(),
                    250,
                    5
            );

            // Reset referral count to 0 after reward earned
            referrer.setReferralCount(0);
            userRepository.save(referrer);
            log.info("Reward created for customer {} for reaching 5 referrals. referralCount reset to 0.", referrer.getEmail());
        }
    }

    @Transactional(readOnly = true)
    public ReferralStatsResponse getMyReferralStats(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        String referralLink = baseUrl + "/register?ref=" + customer.getReferralCode();
        long totalReferrals = referralRepository.findByReferrerId(customer.getId()).size();
        long confirmedReferrals = referralRepository.countByReferrerIdAndStatus(customer.getId(), ReferralStatus.CONFIRMED);
        long pendingReferrals = referralRepository.countByReferrerIdAndStatus(customer.getId(), ReferralStatus.PENDING);

        List<Reward> pendingRewards = rewardRepository.findByCustomerIdAndStatus(customer.getId(), RewardStatus.PENDING);
        List<RewardResponse> pendingRewardDtos = pendingRewards.stream()
                .map(this::mapToRewardResponse)
                .collect(Collectors.toList());

        return ReferralStatsResponse.builder()
                .referralCode(customer.getReferralCode())
                .referralLink(referralLink)
                .totalReferrals(totalReferrals)
                .confirmedReferrals(confirmedReferrals)
                .pendingReferrals(pendingReferrals)
                .pendingRewards(pendingRewardDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RewardResponse> getMyRewards(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return rewardRepository.findByCustomerId(customer.getId()).stream()
                .map(this::mapToRewardResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RewardResponse applyRewardToOrder(Long rewardId, Long orderId, String customerEmail) {
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found with id: " + rewardId));

        if (!reward.getCustomer().getEmail().equals(customerEmail)) {
            throw new IllegalArgumentException("Unauthorized reward access");
        }

        if (reward.getStatus() == RewardStatus.APPLIED) {
            throw new IllegalArgumentException("Reward already applied");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getCustomer().getEmail().equals(customerEmail)) {
            throw new IllegalArgumentException("Order does not belong to customer");
        }

        reward.setAppliedToOrder(order);
        reward.setStatus(RewardStatus.APPLIED);
        Reward savedReward = rewardRepository.save(reward);

        order.setNotes("250g reward applied");
        orderRepository.save(order);

        return mapToRewardResponse(savedReward);
    }

    @Transactional(readOnly = true)
    public List<ReferralResponse> getAllReferrals() {
        return referralRepository.findAll().stream()
                .map(this::mapToReferralResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReferralStatsResponse> getReferralLeaderboard() {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "referralCount"));

        return users.stream()
                .limit(10)
                .map(user -> {
                    String referralLink = baseUrl + "/register?ref=" + user.getReferralCode();
                    long total = referralRepository.findByReferrerId(user.getId()).size();
                    long confirmed = referralRepository.countByReferrerIdAndStatus(user.getId(), ReferralStatus.CONFIRMED);
                    long pending = referralRepository.countByReferrerIdAndStatus(user.getId(), ReferralStatus.PENDING);
                    List<RewardResponse> pendingRewardDtos = rewardRepository.findByCustomerIdAndStatus(user.getId(), RewardStatus.PENDING)
                            .stream().map(this::mapToRewardResponse).collect(Collectors.toList());

                    return ReferralStatsResponse.builder()
                            .referralCode(user.getReferralCode())
                            .referralLink(referralLink)
                            .totalReferrals(total)
                            .confirmedReferrals(confirmed)
                            .pendingReferrals(pending)
                            .pendingRewards(pendingRewardDtos)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private ReferralResponse mapToReferralResponse(Referral referral) {
        return ReferralResponse.builder()
                .id(referral.getId())
                .referrerName(referral.getReferrer().getName())
                .referrerEmail(referral.getReferrer().getEmail())
                .referredName(referral.getReferred().getName())
                .referredEmail(referral.getReferred().getEmail())
                .status(referral.getStatus())
                .createdAt(referral.getCreatedAt())
                .build();
    }

    private RewardResponse mapToRewardResponse(Reward reward) {
        return RewardResponse.builder()
                .id(reward.getId())
                .customerName(reward.getCustomer().getName())
                .grams(reward.getGrams())
                .reason(reward.getReason())
                .status(reward.getStatus())
                .appliedToOrderId(reward.getAppliedToOrder() != null ? reward.getAppliedToOrder().getId() : null)
                .createdAt(reward.getCreatedAt())
                .build();
    }
}
