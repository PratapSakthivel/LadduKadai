package com.laddukadai.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

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

    public void sendSubscriptionConfirmationToCustomer(
            String toEmail, String customerName, String productName,
            BigDecimal quantityKg, BigDecimal totalAmount,
            LocalDate firstDeliveryDate, Integer frequencyDays, String address) {
        String subject = "Your Laddu Kadai Subscription is Confirmed!";
        String body = String.format(
                "Hello %s,\n\n" +
                "Your subscription at Laddu Kadai has been successfully created!\n\n" +
                "Subscription Details:\n" +
                "- Product: %s\n" +
                "- Quantity per Delivery: %s kg\n" +
                "- Total per Delivery: ₹%s\n" +
                "- Frequency: Every %d days\n" +
                "- First Delivery Date: %s\n" +
                "- Delivery Address: %s\n\n" +
                "Note: You will receive a reminder email 2 days before each scheduled delivery.\n\n" +
                "Warm regards,\n" +
                "The Laddu Kadai Team",
                customerName, productName, quantityKg, totalAmount, frequencyDays, firstDeliveryDate, address
        );
        sendEmail(toEmail, subject, body);
    }

    public void sendDeliveryReminderToCustomer(
            String toEmail, String customerName, String productName,
            BigDecimal quantityKg, BigDecimal totalAmount,
            LocalDate deliveryDate, String cancelLink) {
        String subject = "Reminder: Your Laddu Kadai Delivery is in 2 Days!";
        String body = String.format(
                "Hello %s,\n\n" +
                "This is a friendly reminder that your upcoming Laddu Kadai subscription delivery is scheduled for %s.\n\n" +
                "Delivery Details:\n" +
                "- Product: %s\n" +
                "- Quantity: %s kg\n" +
                "- Total Amount: ₹%s\n\n" +
                "If you need to skip or cancel this subscription, you can do so here:\n%s\n\n" +
                "Warm regards,\n" +
                "The Laddu Kadai Team",
                customerName, deliveryDate, productName, quantityKg, totalAmount, cancelLink
        );
        sendEmail(toEmail, subject, body);
    }

    public void sendSubscriptionCancelledToOwner(
            String ownerEmail, String customerName, String customerPhone,
            String productName, LocalDate cancelledDeliveryDate) {
        String subject = "Subscription Cancelled — " + customerName;
        String body = String.format(
                "Hello Owner,\n\n" +
                "A subscription has been cancelled.\n\n" +
                "Customer: %s (%s)\n" +
                "Product: %s\n" +
                "Next Scheduled Delivery Was: %s\n\n" +
                "Regards,\n" +
                "Laddu Kadai System",
                customerName, customerPhone, productName, cancelledDeliveryDate
        );
        sendEmail(ownerEmail, subject, body);
    }

    public void sendSubscriptionRenewalReminder(
            String toEmail, String customerName, String productName, LocalDate expiryDate) {
        String subject = "Your Laddu Kadai Subscription Renews Soon";
        String body = String.format(
                "Hello %s,\n\n" +
                "Your subscription for %s has an upcoming delivery date around %s.\n" +
                "We encourage you to keep enjoying our fresh, organic laddus!\n\n" +
                "Warm regards,\n" +
                "The Laddu Kadai Team",
                customerName, productName, expiryDate
        );
        sendEmail(toEmail, subject, body);
    }

    public void sendSubscriptionPausedConfirmation(
            String toEmail, String customerName, LocalDate pausedUntil) {
        String subject = "Your Subscription has been Paused";
        String body = String.format(
                "Hello %s,\n\n" +
                "Your subscription at Laddu Kadai has been paused until %s.\n" +
                "It will automatically resume after this date.\n\n" +
                "Warm regards,\n" +
                "The Laddu Kadai Team",
                customerName, pausedUntil
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
