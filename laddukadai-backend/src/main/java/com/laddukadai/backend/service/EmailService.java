package com.laddukadai.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendWelcomeEmail(String toEmail, String name) {
        String subject = "Welcome to Laddu Kadai!";
        String body = String.format(
                "Hello %s,\n\n" +
                "Welcome to Laddu Kadai! Your account has been created successfully.\n\n" +
                "Get ready to experience the rich tradition of our family-owned organic sweet shop. " +
                "From our hand-rolled organic laddus to pure ghee delicacies, we are committed to bringing sweetness and health straight to your doorstep.\n\n" +
                "Thank you for joining us!\n\n" +
                "Warm regards,\n" +
                "The Laddu Kadai Team",
                name
        );
        sendEmail(toEmail, subject, body);
    }

    /**
     * Generic helper method to send a simple plain text email.
     * Catches and logs all exceptions to ensure email failures do not disrupt execution flows.
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }
}
