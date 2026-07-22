package com.laddukadai.backend.service;

import com.laddukadai.backend.dto.InstantOrderRequest;
import com.laddukadai.backend.dto.OrderResponse;
import com.laddukadai.backend.exception.ResourceNotFoundException;
import com.laddukadai.backend.model.*;
import com.laddukadai.backend.repository.OrderRepository;
import com.laddukadai.backend.repository.ProductRepository;
import com.laddukadai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public OrderResponse placeInstantOrder(InstantOrderRequest request, String customerEmail) {
        // Load customer
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerEmail));

        // Load product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        // Validate availability
        if (Boolean.FALSE.equals(product.getIsAvailable())) {
            throw new IllegalArgumentException("Product not available");
        }

        // Validate stock
        if (product.getStockKg().compareTo(request.getQuantityKg()) < 0) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available: " + product.getStockKg() + " kg");
        }

        // Calculate total
        BigDecimal totalAmount = request.getQuantityKg().multiply(product.getPricePerKg());

        // Build order
        Order order = Order.builder()
                .customer(customer)
                .product(product)
                .quantityKg(request.getQuantityKg())
                .orderType(OrderType.INSTANT)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .deliveryAddress(request.getDeliveryAddress())
                .build();

        // Deduct stock
        BigDecimal remainingStock = product.getStockKg().subtract(request.getQuantityKg());
        if (remainingStock.compareTo(BigDecimal.ZERO) <= 0) {
            product.setStockKg(BigDecimal.ZERO);
            product.setIsAvailable(false);
        } else {
            product.setStockKg(remainingStock);
        }
        productRepository.save(product);

        // Check low stock (after deduction)
        if (product.getStockKg().compareTo(new BigDecimal("2.0")) <= 0) {
            List<User> owners = userRepository.findByRole(Role.OWNER);
            if (!owners.isEmpty()) {
                emailService.sendLowStockAlert(owners.get(0).getEmail(), product.getName(), product.getStockKg());
            } else {
                log.warn("No owner found to send low stock alert for product: {}", product.getName());
            }
        }

        // Save order
        Order saved = orderRepository.save(order);

        // Send emails
        emailService.sendInstantOrderConfirmationToCustomer(
                customer.getEmail(), customer.getName(), product.getName(),
                request.getQuantityKg(), totalAmount, request.getDeliveryAddress());

        List<User> owners = userRepository.findByRole(Role.OWNER);
        if (!owners.isEmpty()) {
            emailService.sendNewInstantOrderAlertToOwner(
                    owners.get(0).getEmail(), customer.getName(), customer.getPhone(),
                    product.getName(), request.getQuantityKg(), totalAmount, request.getDeliveryAddress());
        } else {
            log.warn("No owner found to send new order alert.");
        }

        return mapToResponse(saved);
    }

    public List<OrderResponse> getMyOrders(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerEmail));
        return orderRepository.findByCustomerId(customer.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setStatus(OrderStatus.CONFIRMED);
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String requesterEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterEmail));

        // Customers can only cancel their own orders
        if (requester.getRole() == Role.CUSTOMER) {
            if (!order.getCustomer().getEmail().equals(requesterEmail)) {
                throw new IllegalArgumentException("Not authorized to cancel this order");
            }
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot cancel a delivered order");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Order already cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore stock
        Product product = order.getProduct();
        BigDecimal restored = product.getStockKg().add(order.getQuantityKg());
        product.setStockKg(restored);
        if (restored.compareTo(BigDecimal.ZERO) > 0) {
            product.setIsAvailable(true);
        }
        productRepository.save(product);

        return mapToResponse(orderRepository.save(order));
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerName(order.getCustomer().getName())
                .customerEmail(order.getCustomer().getEmail())
                .customerPhone(order.getCustomer().getPhone())
                .productName(order.getProduct().getName())
                .pricePerKg(order.getProduct().getPricePerKg())
                .quantityKg(order.getQuantityKg())
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryDate(order.getDeliveryDate())
                .deliveryManName(order.getDeliveryMan() != null ? order.getDeliveryMan().getName() : null)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
