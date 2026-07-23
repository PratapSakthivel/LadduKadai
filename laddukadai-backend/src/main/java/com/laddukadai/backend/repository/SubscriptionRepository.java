package com.laddukadai.backend.repository;

import com.laddukadai.backend.model.Subscription;
import com.laddukadai.backend.model.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByCustomerId(Long customerId);

    List<Subscription> findByStatus(SubscriptionStatus status);

    List<Subscription> findByNextDeliveryDateAndStatus(LocalDate date, SubscriptionStatus status);

    List<Subscription> findByNextDeliveryDateBeforeAndStatus(LocalDate date, SubscriptionStatus status);

    List<Subscription> findByPausedUntilAndStatus(LocalDate date, SubscriptionStatus status);
}
