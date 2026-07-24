package com.laddukadai.backend.repository;

import com.laddukadai.backend.model.Referral;
import com.laddukadai.backend.model.ReferralStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReferralRepository extends JpaRepository<Referral, Long> {

    List<Referral> findByReferrerId(Long referrerId);

    Optional<Referral> findByReferredId(Long referredId);

    boolean existsByReferredId(Long referredId);

    long countByReferrerIdAndStatus(Long referrerId, ReferralStatus status);

    List<Referral> findByReferrerIdAndStatus(Long referrerId, ReferralStatus status);
}
