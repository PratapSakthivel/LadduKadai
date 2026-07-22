package com.laddukadai.backend.repository;

import com.laddukadai.backend.model.Order;
import com.laddukadai.backend.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByDeliveryManId(Long deliveryManId);

    List<Order> findByDeliveryDate(LocalDate date);
}
