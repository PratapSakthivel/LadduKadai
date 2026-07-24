package com.laddukadai.backend.scheduler;

import com.laddukadai.backend.model.*;
import com.laddukadai.backend.repository.*;
import com.laddukadai.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EodReportRepository eodReportRepository;
    private final EmailService emailService;

    @Value("${app.base-url:http://localhost:4200}")
    private String baseUrl;

    // ─── Subscription Tasks ───────────────────────────────────────────────────

    @Scheduled(cron = "0 0 9 * * *")
    public void sendDeliveryReminders() {
        log.info("Running scheduled task: sendDeliveryReminders");
        LocalDate targetDate = LocalDate.now().plusDays(2);
        List<Subscription> subscriptions = subscriptionRepository
                .findByNextDeliveryDateAndStatus(targetDate, SubscriptionStatus.ACTIVE);

        for (Subscription sub : subscriptions) {
            BigDecimal totalAmount = sub.getQuantityKg().multiply(sub.getProduct().getPricePerKg());
            String cancelLink = baseUrl + "/cancel-delivery/" + sub.getId();
            emailService.sendDeliveryReminderToCustomer(
                    sub.getCustomer().getEmail(),
                    sub.getCustomer().getName(),
                    sub.getProduct().getName(),
                    sub.getQuantityKg(),
                    totalAmount,
                    sub.getNextDeliveryDate(),
                    cancelLink
            );
        }
    }

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void processNextDeliveryDate() {
        log.info("Running scheduled task: processNextDeliveryDate");
        LocalDate today = LocalDate.now();
        List<Subscription> subscriptions = subscriptionRepository
                .findByNextDeliveryDateAndStatus(today, SubscriptionStatus.ACTIVE);

        for (Subscription sub : subscriptions) {
            Product product = sub.getProduct();

            if (Boolean.FALSE.equals(product.getIsAvailable()) || product.getStockKg().compareTo(sub.getQuantityKg()) < 0) {
                log.warn("Insufficient stock or product unavailable for subscription id: {}. Skipping order creation.", sub.getId());
                List<User> owners = userRepository.findByRole(Role.OWNER);
                if (!owners.isEmpty()) {
                    emailService.sendLowStockAlert(owners.get(0).getEmail(), product.getName(), product.getStockKg());
                }
                continue;
            }

            BigDecimal totalAmount = sub.getQuantityKg().multiply(product.getPricePerKg());

            Order order = Order.builder()
                    .customer(sub.getCustomer())
                    .product(product)
                    .quantityKg(sub.getQuantityKg())
                    .orderType(OrderType.SUBSCRIPTION)
                    .status(OrderStatus.PENDING)
                    .totalAmount(totalAmount)
                    .deliveryAddress(sub.getDeliveryAddress())
                    .build();

            // Deduct stock
            BigDecimal remainingStock = product.getStockKg().subtract(sub.getQuantityKg());
            if (remainingStock.compareTo(BigDecimal.ZERO) <= 0) {
                product.setStockKg(BigDecimal.ZERO);
                product.setIsAvailable(false);
            } else {
                product.setStockKg(remainingStock);
            }
            productRepository.save(product);

            if (product.getStockKg().compareTo(new BigDecimal("2.0")) <= 0) {
                List<User> owners = userRepository.findByRole(Role.OWNER);
                if (!owners.isEmpty()) {
                    emailService.sendLowStockAlert(owners.get(0).getEmail(), product.getName(), product.getStockKg());
                }
            }

            orderRepository.save(order);

            sub.setNextDeliveryDate(sub.getNextDeliveryDate().plusDays(sub.getFrequencyDays()));
            subscriptionRepository.save(sub);
            log.info("Auto-created order for subscription id: {}, next delivery: {}", sub.getId(), sub.getNextDeliveryDate());
        }
    }

    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void resumePausedSubscriptions() {
        log.info("Running scheduled task: resumePausedSubscriptions");
        LocalDate today = LocalDate.now();
        List<Subscription> subscriptions = subscriptionRepository
                .findByPausedUntilAndStatus(today, SubscriptionStatus.PAUSED);

        for (Subscription sub : subscriptions) {
            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setPausedUntil(null);
            sub.setNextDeliveryDate(today.plusDays(sub.getFrequencyDays()));
            subscriptionRepository.save(sub);
            log.info("Auto-resumed subscription id: {}, next delivery: {}", sub.getId(), sub.getNextDeliveryDate());
        }
    }

    @Scheduled(cron = "0 30 7 * * *")
    @Transactional
    public void markExpiredSubscriptions() {
        log.info("Running scheduled task: markExpiredSubscriptions");
        LocalDate cutoffDate = LocalDate.now().minusDays(90);
        List<Subscription> subscriptions = subscriptionRepository
                .findByNextDeliveryDateBeforeAndStatus(cutoffDate, SubscriptionStatus.ACTIVE);

        for (Subscription sub : subscriptions) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(sub);
            log.info("Marked subscription id: {} as EXPIRED", sub.getId());
        }
    }

    // ─── Delivery Tasks ───────────────────────────────────────────────────────

    @Scheduled(cron = "0 0 20 * * *")
    public void checkMissingEodReports() {
        log.info("Running scheduled task: checkMissingEodReports");
        LocalDate today = LocalDate.now();
        List<User> deliveryMen = userRepository.findByRole(Role.DELIVERY_MAN);
        List<User> owners = userRepository.findByRole(Role.OWNER);

        for (User deliveryMan : deliveryMen) {
            boolean submitted = eodReportRepository.existsByDeliveryManIdAndReportDate(deliveryMan.getId(), today);
            if (!submitted) {
                log.warn("Delivery man {} has not submitted EOD report for {}", deliveryMan.getName(), today);
                if (!owners.isEmpty()) {
                    emailService.sendMissingEodAlertToOwner(owners.get(0).getEmail(), deliveryMan.getName());
                }
            }
        }
    }
}
