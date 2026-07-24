package com.laddukadai.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;

@Entity
@Table(name = "eod_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EodReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_man_id", nullable = false)
    private User deliveryMan;

    @Column(nullable = false)
    private LocalDate reportDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCash;

    @Column(nullable = false)
    private Integer totalDeliveries;

    @Builder.Default
    @Column(nullable = false)
    private Integer totalNotHome = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer totalRejected = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isVerified = false;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp submittedAt;
}
