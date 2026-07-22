package com.laddukadai.backend.service;

import com.laddukadai.backend.config.JwtUtil;
import com.laddukadai.backend.dto.AuthResponse;
import com.laddukadai.backend.dto.LoginRequest;
import com.laddukadai.backend.dto.RegisterRequest;
import com.laddukadai.backend.exception.DuplicateResourceException;
import com.laddukadai.backend.exception.InvalidCredentialsException;
import com.laddukadai.backend.model.User;
import com.laddukadai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone already registered");
        }

        String referralCode = generateUniqueReferralCode();
        String finalReferredBy = null;

        if (request.getReferredByCode() != null && !request.getReferredByCode().isBlank()) {
            Optional<User> referrerOpt = userRepository.findByReferralCode(request.getReferredByCode());
            if (referrerOpt.isPresent()) {
                User referrer = referrerOpt.get();
                // Ensure it's not a self-referral using own email or phone
                if (!referrer.getEmail().equals(request.getEmail()) && !referrer.getPhone().equals(request.getPhone())) {
                    finalReferredBy = request.getReferredByCode();
                }
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .referralCode(referralCode)
                .referredBy(finalReferredBy)
                .build();

        user = userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        String jwt = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(jwt)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .referralCode(user.getReferralCode())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String jwt = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(jwt)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .referralCode(user.getReferralCode())
                .build();
    }

    public User getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        user.setPassword(null); // Exclude password from the response
        return user;
    }

    private String generateUniqueReferralCode() {
        SecureRandom random = new SecureRandom();
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        String code;
        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(characters.charAt(random.nextInt(characters.length())));
            }
            code = sb.toString();
        } while (userRepository.findByReferralCode(code).isPresent());
        return code;
    }
}
