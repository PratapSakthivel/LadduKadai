package com.laddukadai.backend.controller;

import com.laddukadai.backend.dto.InstantOrderRequest;
import com.laddukadai.backend.dto.OrderResponse;
import com.laddukadai.backend.service.OrderService;
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
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/instant")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> placeInstantOrder(@Valid @RequestBody InstantOrderRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeInstantOrder(request, email));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(orderService.getMyOrders(email));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OrderResponse> confirmOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.confirmOrder(id));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('OWNER')")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(orderService.cancelOrder(id, email));
    }
}
