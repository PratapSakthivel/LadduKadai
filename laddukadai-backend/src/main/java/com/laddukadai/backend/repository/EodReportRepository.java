package com.laddukadai.backend.repository;

import com.laddukadai.backend.model.EodReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EodReportRepository extends JpaRepository<EodReport, Long> {

    Optional<EodReport> findByDeliveryManIdAndReportDate(Long deliveryManId, LocalDate date);

    List<EodReport> findByReportDate(LocalDate date);

    boolean existsByDeliveryManIdAndReportDate(Long deliveryManId, LocalDate date);
}
