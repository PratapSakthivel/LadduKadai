package com.laddukadai.backend.service;

import com.laddukadai.backend.dto.SubscriptionRequest;
import com.laddukadai.backend.dto.SubscriptionResponse;
import com.laddukadai.backend.exception.ResourceNotFoundException;
import com.laddukadai.backend.model.*;
import com.laddukadai.backend.repository.ProductRepository;
import com.laddukadai.backend.repository.SubscriptionRepository;
import com.laddukadai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public SubscriptionResponse createSubscription(SubscriptionRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + customerEmail));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (Boolean.FALSE.equals(product.getIsAvailable())) {
            throw new IllegalArgumentException("Product not available");
        }

        if (request.getFirstDeliveryDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new IllegalArgumentException("First delivery date must be in the future");
        }

        if (request.getFrequencyDays() < 7) {
            throw new IllegalArgumentException("Minimum delivery frequency is 7 days");
        }

        BigDecimal totalAmountPerDelivery = request.getQuantityKg().multiply(product.getPricePerKg());

        Subscription subscription = Subscription.builder()
                .customer(customer)
                .product(product)
                .quantityKg(request.getQuantityKg())
                .frequencyDays(request.getFrequencyDays())
                .nextDeliveryDate(request.getFirstDeliveryDate())
                .status(SubscriptionStatus.ACTIVE)
                .deliveryAddress(request.getDeliveryAddress())
                .build();

        Subscription saved = subscriptionRepository.save(subscription);

        emailService.sendSubscriptionConfirmationToCustomer(
                customer.getEmail(), customer.getName(), product.getName(),
                request.getQuantityKg(), totalAmountPerDelivery,
                request.getFirstDeliveryDate(), request.getFrequencyDays(),
                request.getDeliveryAddress()
        );

        List<User> owners = userRepository.findByRole(Role.OWNER);
        if (!owners.isEmpty()) {
            emailService.sendNewInstantOrderAlertToOwner(
                    owners.get(0).getEmail(), customer.getName(), customer.getPhone(),
                    product.getName() + " [SUBSCRIPTION ORDER]", request.getQuantityKg(),
                    totalAmountPerDelivery, request.getDeliveryAddress()
            );
        } else {
            log.warn("No owner found to send subscription alert.");
        }

        return mapToResponse(saved);
    }

    public List<SubscriptionResponse> getMySubscriptions(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + customerEmail));
        return subscriptionRepository.findByCustomerId(customer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SubscriptionResponse> getAllSubscriptions() {
        return subscriptionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionResponse pauseSubscription(Long subscriptionId, String customerEmail, LocalDate pauseUntilDate) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));

        if (!subscription.getCustomer().getEmail().equals(customerEmail)) {
            throw new IllegalArgumentException("Not authorized to pause this subscription");
        }

        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active subscriptions can be paused");
        }

        if (pauseUntilDate.isBefore(LocalDate.now().plusDays(1))) {
            throw new IllegalArgumentException("Pause until date must be in the future");
        }

        subscription.setStatus(SubscriptionStatus.PAUSED);
        subscription.setPausedUntil(pauseUntilDate);

        Subscription saved = subscriptionRepository.save(subscription);

        emailService.sendSubscriptionPausedConfirmation(
                subscription.getCustomer().getEmail(),
                subscription.getCustomer().getName(),
                pauseUntilDate
        );

        return mapToResponse(saved);
    }

    @Transactional
    public SubscriptionResponse cancelSubscription(Long subscriptionId, String requesterEmail) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + requesterEmail));

        boolean isCustomer = requester.getRole() == Role.CUSTOMER;
        boolean isOwner = requester.getRole() == Role.OWNER;

        if (isCustomer && !subscription.getCustomer().getEmail().equals(requesterEmail)) {
            throw new IllegalArgumentException("Not authorized to cancel this subscription");
        }

        if (!isCustomer && !isOwner) {
            throw new IllegalArgumentException("Not authorized to cancel this subscription");
        }

        if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
            throw new IllegalArgumentException("Subscription already cancelled");
        }

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        Subscription saved = subscriptionRepository.save(subscription);

        List<User> owners = userRepository.findByRole(Role.OWNER);
        if (!owners.isEmpty()) {
            emailService.sendSubscriptionCancelledToOwner(
                    owners.get(0).getEmail(),
                    subscription.getCustomer().getName(),
                    subscription.getCustomer().getPhone(),
                    subscription.getProduct().getName(),
                    subscription.getNextDeliveryDate()
            );
        }

        return mapToResponse(saved);
    }

    @Transactional
    public SubscriptionResponse resumeSubscription(Long subscriptionId, String customerEmail) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));

        if (!subscription.getCustomer().getEmail().equals(customerEmail)) {
            throw new IllegalArgumentException("Not authorized to resume this subscription");
        }

        if (subscription.getStatus() != SubscriptionStatus.PAUSED) {
            throw new IllegalArgumentException("Only paused subscriptions can be resumed");
        }

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setPausedUntil(null);

        if (subscription.getNextDeliveryDate().isBefore(LocalDate.now())) {
            subscription.setNextDeliveryDate(LocalDate.now().plusDays(subscription.getFrequencyDays()));
        }

        Subscription saved = subscriptionRepository.save(subscription);
        return mapToResponse(saved);
    }

    private SubscriptionResponse mapToResponse(Subscription sub) {
        BigDecimal total = sub.getQuantityKg().multiply(sub.getProduct().getPricePerKg());
        return SubscriptionResponse.builder()
                .id(sub.getId())
                .customerName(sub.getCustomer().getName())
                .customerEmail(sub.getCustomer().getEmail())
                .productName(sub.getProduct().getName())
                .pricePerKg(sub.getProduct().getPricePerKg())
                .quantityKg(sub.getQuantityKg())
                .frequencyDays(sub.getFrequencyDays())
                .nextDeliveryDate(sub.getNextDeliveryDate())
                .status(sub.getStatus())
                .pausedUntil(sub.getPausedUntil())
                .deliveryAddress(sub.getDeliveryAddress())
                .totalAmountPerDelivery(total)
                .createdAt(sub.getCreatedAt())
                .build();
    }
}
