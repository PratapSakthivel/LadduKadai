package com.laddukadai.backend.controller;

import com.laddukadai.backend.dto.*;
import com.laddukadai.backend.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/assign/{orderId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<DeliveryResponse> assignDelivery(
            @PathVariable Long orderId,
            @RequestParam Long deliveryManId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String ownerEmail = auth.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(deliveryService.assignDelivery(orderId, deliveryManId, ownerEmail));
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('DELIVERY_MAN')")
    public ResponseEntity<List<DeliveryResponse>> getTodayDeliveries() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(deliveryService.getTodayDeliveries(email));
    }

    @PatchMapping("/{id}/delivered")
    @PreAuthorize("hasRole('DELIVERY_MAN')")
    public ResponseEntity<DeliveryResponse> markDelivered(
            @PathVariable Long id,
            @Valid @RequestBody MarkDeliveredRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(deliveryService.markDelivered(id, request, email));
    }

    @PatchMapping("/{id}/not-home")
    @PreAuthorize("hasRole('DELIVERY_MAN')")
    public ResponseEntity<DeliveryResponse> markNotHome(
            @PathVariable Long id,
            @Valid @RequestBody MarkNotHomeRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(deliveryService.markNotHome(id, request, email));
    }

    @PatchMapping("/{id}/rejected")
    @PreAuthorize("hasRole('DELIVERY_MAN')")
    public ResponseEntity<DeliveryResponse> markRejected(
            @PathVariable Long id,
            @Valid @RequestBody MarkRejectedRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(deliveryService.markRejected(id, request, email));
    }

    @PostMapping("/eod")
    @PreAuthorize("hasRole('DELIVERY_MAN')")
    public ResponseEntity<EodReportResponse> submitEodReport() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(deliveryService.submitEodReport(email));
    }

    @GetMapping("/eod/all")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<EodReportResponse>> getAllEodReports() {
        return ResponseEntity.ok(deliveryService.getAllEodReports());
    }

    @PatchMapping("/eod/{id}/verify")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<EodReportResponse> verifyEodReport(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.verifyEodReport(id));
    }

    @PatchMapping("/{id}/reverse")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<DeliveryResponse> reverseDeliveryStatus(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String ownerEmail = auth.getName();
        return ResponseEntity.ok(deliveryService.reverseDeliveryStatus(id, ownerEmail));
    }
}
