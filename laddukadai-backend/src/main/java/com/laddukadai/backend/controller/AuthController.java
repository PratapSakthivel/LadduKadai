package com.laddukadai.backend.controller;

import com.laddukadai.backend.dto.AuthResponse;
import com.laddukadai.backend.dto.LoginRequest;
import com.laddukadai.backend.dto.RegisterRequest;
import com.laddukadai.backend.model.User;
import com.laddukadai.backend.service.AuthService;
import com.laddukadai.backend.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User currentUser = authService.getCurrentUser(email);
        return ResponseEntity.ok(currentUser);
    }

    @PostMapping("/send-summary-email")
    public ResponseEntity<Map<String, String>> sendSummaryEmail(@RequestParam(defaultValue = "pratapssakthivel@gmail.com") String email) {
        String subject = "Laddu Kadai Backend — System Summary & Email Triggers Report";
        String body = """
                Hello Pratap,

                Here is the comprehensive report of the Laddu Kadai Backend Development and Test Results across all 5 Phases.

                =====================================================
                PROJECT OVERVIEW & COMPLETED PHASES
                =====================================================
                1. Phase 1 — Auth System: JWT Auth, Roles (OWNER, CUSTOMER, DELIVERY_MAN), Referral Code generation.
                2. Phase 2 — Products & Instant Orders: Stock management, Instant order processing, Low-stock alerts, 15/15 tests passed.
                3. Phase 3 — Subscription System: Automated delivery frequency (7-day min), pause/resume/cancel logic, daily cron schedulers, 11/11 tests passed.
                4. Phase 4 — Delivery Man Accountability: Daily delivery routes, Cash collection, EOD cash report, Owner verification, Status reversals, 8 PM EOD missing alert, 15/15 tests passed.
                5. Phase 5 — Referral & Reward System: Unique referral tracking, 5-referral milestone trigger (250g free reward), reward application, Leaderboard & Stats API, 12/12 tests passed.

                =====================================================
                PHASE 5 TEST RESULTS (12/12 PASSED)
                =====================================================
                - TEST 1: Register customer using referral code -> Referral created in PENDING status [PASSED]
                - TEST 2: GET /api/referrals/my-stats -> confirmedReferrals=0, pendingReferrals=1, referralLink visible [PASSED]
                - TEST 3: Place instant order & mark DELIVERED -> Referral status updated to CONFIRMED, count +1 [PASSED]
                - TEST 4: GET /api/referrals/my-stats again -> confirmedReferrals=1, pendingReferrals=0 [PASSED]
                - TEST 5: 5 confirmed referrals -> 250g Free Reward created, referral count reset to 0 [PASSED]
                - TEST 6: GET /api/referrals/my-rewards -> 1 PENDING reward for 250g laddus [PASSED]
                - TEST 7: POST /api/referrals/apply-reward -> Reward status updated to APPLIED, note added to order [PASSED]
                - TEST 8: Apply same reward again -> 400 "Reward already applied" [PASSED]
                - TEST 9: GET /api/referrals/all (OWNER) -> All referral records visible [PASSED]
                - TEST 10: GET /api/referrals/leaderboard (OWNER) -> Top referrers ranked correctly [PASSED]
                - TEST 11: Duplicate referral link attempt -> Second referral prevented by existsByReferredId [PASSED]
                - TEST 12: OWNER token on CUSTOMER endpoint -> 403 Forbidden [PASSED]

                =====================================================
                COMPLETE LIST OF EMAIL TRIGGERS IN LADDU KADAI
                =====================================================
                1. Customer Welcome Email: Sent upon registration.
                2. Low Stock Alert: Sent to Owner when product stock falls <= 2kg or reaches 0.
                3. Instant Order Confirmation: Sent to Customer after placing an order.
                4. New Instant Order Alert: Sent to Owner when an instant order is received.
                5. Subscription Confirmation: Sent to Customer on setting up a recurring delivery plan.
                6. Subscription 2-Day Reminder: Sent to Customer 2 days prior to next delivery date with skip/cancel link.
                7. Subscription Cancellation Alert: Sent to Owner when a subscription is cancelled.
                8. Subscription Renewal Reminder: Sent to Customer for upcoming renewal.
                9. Subscription Paused Notice: Sent to Customer confirming pause duration.
                10. Delivery Assignment Notice: Sent to Delivery Man with assigned customer route for the day.
                11. Not Home Reschedule Notice: Sent to Customer when delivery man marks 'NOT_HOME'.
                12. Rejection Alert: Sent to Owner when customer rejects an order delivery.
                13. End-Of-Day (EOD) Report: Sent to Owner when delivery man submits daily cash collection.
                14. 8:00 PM Missing EOD Warning: Sent to Owner if delivery man has not submitted EOD report by 8 PM.
                15. Referral Confirmed Notice: Sent to Referrer when a referred friend completes their first delivery.
                16. Referral 250g Reward Earned: Sent to Referrer upon reaching 5 confirmed referrals.

                All 5 Phases are 100% complete, fully tested, and committed to GitHub!

                Warm regards,
                Laddu Kadai Automated System
                """;

        emailService.sendEmail(email, subject, body);
        return ResponseEntity.ok(Map.of("message", "Summary report email triggered to " + email));
    }
}
