package com.laddukadai.backend.repository;

import com.laddukadai.backend.model.Role;
import com.laddukadai.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByReferralCode(String referralCode);

    List<User> findByRole(Role role);
}
