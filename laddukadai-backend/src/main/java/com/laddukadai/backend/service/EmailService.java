package com.laddukadai.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

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

    public void sendLowStockAlert(String ownerEmail, String productName, BigDecimal stockKg) {
        String subject = "Low Stock Alert — " + productName;
        String body = String.format(
                "Stock is at %s kg. Please restock soon.\n\n" +
                "Product: %s\n" +
                "Current Stock: %s kg\n\n" +
                "Regards,\nLaddu Kadai System",
                stockKg, productName, stockKg
        );
        sendEmail(ownerEmail, subject, body);
    }

    public void sendInstantOrderConfirmationToCustomer(
            String toEmail, String customerName, String productName,
            BigDecimal quantityKg, BigDecimal totalAmount, String address) {
        String subject = "Your Laddu Kadai Order is Placed!";
        String body = String.format(
                "Hello %s,\n\n" +
                "Thank you for your order at Laddu Kadai!\n\n" +
                "Order Summary:\n" +
                "- Product: %s\n" +
                "- Quantity: %s kg\n" +
                "- Total Amount: ₹%s\n" +
                "- Delivery Address: %s\n\n" +
                "Our store owner will review and confirm your order shortly.\n\n" +
                "Warm regards,\n" +
                "The Laddu Kadai Team",
                customerName, productName, quantityKg, totalAmount, address
        );
        sendEmail(toEmail, subject, body);
    }

    public void sendNewInstantOrderAlertToOwner(
            String ownerEmail, String customerName, String customerPhone,
            String productName, BigDecimal quantityKg, BigDecimal totalAmount, String address) {
        String subject = "New Instant Order Received — Action Required!";
        String body = String.format(
                "Hello Owner,\n\n" +
                "A new instant order has been placed on Laddu Kadai!\n\n" +
                "Customer Details:\n" +
                "- Name: %s\n" +
                "- Phone: %s\n\n" +
                "Order Details:\n" +
                "- Product: %s\n" +
                "- Quantity: %s kg\n" +
                "- Total Amount: ₹%s\n" +
                "- Delivery Address: %s\n\n" +
                "Please log into the owner dashboard to confirm this order.\n\n" +
                "Regards,\n" +
                "Laddu Kadai Order System",
                customerName, customerPhone, productName, quantityKg, totalAmount, address
        );
        sendEmail(ownerEmail, subject, body);
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
