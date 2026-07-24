package com.laddukadai.backend.repository;

import com.laddukadai.backend.model.Delivery;
import com.laddukadai.backend.model.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    List<Delivery> findByDeliveryManIdAndScheduledDate(Long deliveryManId, LocalDate scheduledDate);

    List<Delivery> findByDeliveryManIdAndCreatedAtBetween(Long deliveryManId, LocalDateTime start, LocalDateTime end);

    Optional<Delivery> findByOrderId(Long orderId);

    List<Delivery> findByDeliveryManIdAndStatus(Long deliveryManId, DeliveryStatus status);

    List<Delivery> findByRescheduleDateAndStatus(LocalDate date, DeliveryStatus status);

    List<Delivery> findByDeliveryManIdAndScheduledDateAndStatus(Long deliveryManId, LocalDate scheduledDate, DeliveryStatus status);
}
