package com.laddukadai.backend.service;

import com.laddukadai.backend.dto.*;
import com.laddukadai.backend.exception.ResourceNotFoundException;
import com.laddukadai.backend.model.*;
import com.laddukadai.backend.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final EodReportRepository eodReportRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ReferralService referralService;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           EodReportRepository eodReportRepository,
                           OrderRepository orderRepository,
                           UserRepository userRepository,
                           EmailService emailService,
                           @Lazy ReferralService referralService) {
        this.deliveryRepository = deliveryRepository;
        this.eodReportRepository = eodReportRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.referralService = referralService;
    }

    @Transactional
    public DeliveryResponse assignDelivery(Long orderId, Long deliveryManId, String ownerEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User deliveryMan = userRepository.findById(deliveryManId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery man not found with id: " + deliveryManId));

        if (deliveryMan.getRole() != Role.DELIVERY_MAN) {
            throw new IllegalArgumentException("Assigned user is not a delivery man");
        }

        if (deliveryRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalArgumentException("Delivery already assigned for this order");
        }

        Delivery delivery = Delivery.builder()
                .order(order)
                .deliveryMan(deliveryMan)
                .status(DeliveryStatus.PENDING)
                .scheduledDate(LocalDate.now())
                .build();

        order.setDeliveryMan(deliveryMan);
        order.setStatus(OrderStatus.DISPATCHED);

        orderRepository.save(order);
        Delivery saved = deliveryRepository.save(delivery);

        emailService.sendDeliveryAssignedToDeliveryMan(
                deliveryMan.getEmail(),
                deliveryMan.getName(),
                List.of(order.getCustomer().getName()),
                LocalDate.now()
        );

        return mapToDeliveryResponse(saved);
    }

    public List<DeliveryResponse> getTodayDeliveries(String deliveryManEmail) {
        User deliveryMan = userRepository.findByEmail(deliveryManEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery man not found with email: " + deliveryManEmail));

        return deliveryRepository.findByDeliveryManIdAndScheduledDate(deliveryMan.getId(), LocalDate.now())
                .stream()
                .sorted(Comparator.comparing(d -> d.getOrder().getDeliveryAddress(), Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(this::mapToDeliveryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponse markDelivered(Long deliveryId, MarkDeliveredRequest request, String deliveryManEmail) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));

        if (!delivery.getDeliveryMan().getEmail().equals(deliveryManEmail)) {
            throw new IllegalArgumentException("Not authorized to update this delivery");
        }

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new IllegalArgumentException("Delivery already processed");
        }

        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setCashCollected(request.getCashCollected());
        delivery.setDeliveredAt(LocalDateTime.now());
        delivery.setAttemptedAt(LocalDateTime.now());
        if (request.getNotes() != null) {
            delivery.setNotes(request.getNotes());
        }

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        Delivery saved = deliveryRepository.save(delivery);

        // Trigger referral confirmation for the customer
        referralService.confirmReferral(order.getCustomer().getId());

        return mapToDeliveryResponse(saved);
    }

    @Transactional
    public DeliveryResponse markNotHome(Long deliveryId, MarkNotHomeRequest request, String deliveryManEmail) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));

        if (!delivery.getDeliveryMan().getEmail().equals(deliveryManEmail)) {
            throw new IllegalArgumentException("Not authorized to update this delivery");
        }

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new IllegalArgumentException("Delivery already processed");
        }

        if (request.getRescheduleDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new IllegalArgumentException("Reschedule date must be tomorrow or later");
        }

        delivery.setStatus(DeliveryStatus.NOT_HOME);
        delivery.setRescheduleDate(request.getRescheduleDate());
        delivery.setAttemptedAt(LocalDateTime.now());
        if (request.getNotes() != null) {
            delivery.setNotes(request.getNotes());
        }

        deliveryRepository.save(delivery);

        // Create new delivery for the rescheduled date
        Delivery rescheduledDelivery = Delivery.builder()
                .order(delivery.getOrder())
                .deliveryMan(delivery.getDeliveryMan())
                .status(DeliveryStatus.PENDING)
                .scheduledDate(request.getRescheduleDate())
                .build();

        deliveryRepository.save(rescheduledDelivery);

        emailService.sendNotHomeRescheduleToCustomer(
                delivery.getOrder().getCustomer().getEmail(),
                delivery.getOrder().getCustomer().getName(),
                delivery.getOrder().getProduct().getName(),
                request.getRescheduleDate()
        );

        return mapToDeliveryResponse(delivery);
    }

    @Transactional
    public DeliveryResponse markRejected(Long deliveryId, MarkRejectedRequest request, String deliveryManEmail) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));

        if (!delivery.getDeliveryMan().getEmail().equals(deliveryManEmail)) {
            throw new IllegalArgumentException("Not authorized to update this delivery");
        }

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new IllegalArgumentException("Delivery already processed");
        }

        delivery.setStatus(DeliveryStatus.REJECTED);
        delivery.setNotes(request.getNotes());
        delivery.setAttemptedAt(LocalDateTime.now());

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.REJECTED);
        orderRepository.save(order);

        Delivery saved = deliveryRepository.save(delivery);

        List<User> owners = userRepository.findByRole(Role.OWNER);
        if (!owners.isEmpty()) {
            emailService.sendRejectionAlertToOwner(
                    owners.get(0).getEmail(),
                    order.getCustomer().getName(),
                    order.getCustomer().getPhone(),
                    order.getProduct().getName(),
                    request.getNotes()
            );
        }

        return mapToDeliveryResponse(saved);
    }

    @Transactional
    public EodReportResponse submitEodReport(String deliveryManEmail) {
        User deliveryMan = userRepository.findByEmail(deliveryManEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery man not found with email: " + deliveryManEmail));

        LocalDate today = LocalDate.now();

        if (eodReportRepository.existsByDeliveryManIdAndReportDate(deliveryMan.getId(), today)) {
            throw new IllegalArgumentException("EOD report already submitted for today");
        }

        List<Delivery> todayDeliveries = deliveryRepository.findByDeliveryManIdAndScheduledDate(deliveryMan.getId(), today);

        int deliveredCount = 0;
        int notHomeCount = 0;
        int rejectedCount = 0;
        BigDecimal totalCash = BigDecimal.ZERO;

        for (Delivery d : todayDeliveries) {
            if (d.getStatus() == DeliveryStatus.DELIVERED) {
                deliveredCount++;
                if (d.getCashCollected() != null) {
                    totalCash = totalCash.add(d.getCashCollected());
                }
            } else if (d.getStatus() == DeliveryStatus.NOT_HOME) {
                notHomeCount++;
            } else if (d.getStatus() == DeliveryStatus.REJECTED) {
                rejectedCount++;
            }
        }

        EodReport report = EodReport.builder()
                .deliveryMan(deliveryMan)
                .reportDate(today)
                .totalCash(totalCash)
                .totalDeliveries(deliveredCount)
                .totalNotHome(notHomeCount)
                .totalRejected(rejectedCount)
                .isVerified(false)
                .build();

        EodReport saved = eodReportRepository.save(report);

        List<User> owners = userRepository.findByRole(Role.OWNER);
        if (!owners.isEmpty()) {
            emailService.sendEodReportToOwner(
                    owners.get(0).getEmail(),
                    deliveryMan.getName(),
                    today,
                    totalCash,
                    deliveredCount,
                    notHomeCount,
                    rejectedCount
            );
        }

        return mapToEodReportResponse(saved);
    }

    public List<EodReportResponse> getAllEodReports() {
        return eodReportRepository.findAll()
                .stream()
                .map(this::mapToEodReportResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EodReportResponse verifyEodReport(Long reportId) {
        EodReport report = eodReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("EOD report not found with id: " + reportId));

        report.setIsVerified(true);
        EodReport saved = eodReportRepository.save(report);
        return mapToEodReportResponse(saved);
    }

    @Transactional
    public DeliveryResponse reverseDeliveryStatus(Long deliveryId, String ownerEmail) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with id: " + deliveryId));

        if (delivery.getStatus() != DeliveryStatus.DELIVERED) {
            throw new IllegalArgumentException("Can only reverse delivered status");
        }

        delivery.setStatus(DeliveryStatus.PENDING);
        delivery.setCashCollected(null);
        delivery.setDeliveredAt(null);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.DISPATCHED);
        orderRepository.save(order);

        Delivery saved = deliveryRepository.save(delivery);
        return mapToDeliveryResponse(saved);
    }

    private DeliveryResponse mapToDeliveryResponse(Delivery d) {
        return DeliveryResponse.builder()
                .id(d.getId())
                .orderId(d.getOrder().getId())
                .customerName(d.getOrder().getCustomer().getName())
                .customerPhone(d.getOrder().getCustomer().getPhone())
                .customerAddress(d.getOrder().getDeliveryAddress())
                .productName(d.getOrder().getProduct().getName())
                .quantityKg(d.getOrder().getQuantityKg())
                .amountToCollect(d.getOrder().getTotalAmount())
                .status(d.getStatus())
                .deliveryManName(d.getDeliveryMan().getName())
                .attemptedAt(d.getAttemptedAt())
                .deliveredAt(d.getDeliveredAt())
                .rescheduleDate(d.getRescheduleDate())
                .notes(d.getNotes())
                .createdAt(d.getCreatedAt())
                .build();
    }

    private EodReportResponse mapToEodReportResponse(EodReport r) {
        return EodReportResponse.builder()
                .id(r.getId())
                .deliveryManName(r.getDeliveryMan().getName())
                .reportDate(r.getReportDate())
                .totalCash(r.getTotalCash())
                .totalDeliveries(r.getTotalDeliveries())
                .totalNotHome(r.getTotalNotHome())
                .totalRejected(r.getTotalRejected())
                .isVerified(r.getIsVerified())
                .submittedAt(r.getSubmittedAt())
                .build();
    }
}
