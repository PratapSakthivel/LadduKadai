package com.laddukadai.backend.repository;

import com.laddukadai.backend.model.Reward;
import com.laddukadai.backend.model.RewardStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RewardRepository extends JpaRepository<Reward, Long> {

    List<Reward> findByCustomerIdAndStatus(Long customerId, RewardStatus status);

    List<Reward> findByCustomerId(Long customerId);
}
