package com.laddukadai.backend.controller;

import com.laddukadai.backend.dto.SubscriptionRequest;
import com.laddukadai.backend.dto.SubscriptionResponse;
import com.laddukadai.backend.scheduler.SubscriptionScheduler;
import com.laddukadai.backend.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final SubscriptionScheduler subscriptionScheduler;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SubscriptionResponse> createSubscription(@Valid @RequestBody SubscriptionRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.createSubscription(request, email));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<SubscriptionResponse>> getMySubscriptions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(subscriptionService.getMySubscriptions(email));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<SubscriptionResponse>> getAllSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    @PatchMapping("/{id}/pause")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SubscriptionResponse> pauseSubscription(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pauseUntilDate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(subscriptionService.pauseSubscription(id, email, pauseUntilDate));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('OWNER')")
    public ResponseEntity<SubscriptionResponse> cancelSubscription(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(subscriptionService.cancelSubscription(id, email));
    }

    @PatchMapping("/{id}/resume")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SubscriptionResponse> resumeSubscription(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(subscriptionService.resumeSubscription(id, email));
    }

    @PostMapping("/process-deliveries")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<String> processDeliveries() {
        subscriptionScheduler.processNextDeliveryDate();
        return ResponseEntity.ok("Processed scheduled subscription deliveries");
    }
}
