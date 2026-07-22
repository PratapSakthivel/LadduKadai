package com.laddukadai.backend.service;

import com.laddukadai.backend.dto.ProductRequest;
import com.laddukadai.backend.dto.ProductResponse;
import com.laddukadai.backend.exception.ResourceNotFoundException;
import com.laddukadai.backend.model.Product;
import com.laddukadai.backend.model.Role;
import com.laddukadai.backend.model.User;
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
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        BigDecimal stock = request.getStockKg() != null ? request.getStockKg() : BigDecimal.ZERO;
        boolean isAvailable = stock.compareTo(BigDecimal.ZERO) > 0;

        Product product = Product.builder()
                .name(request.getName())
                .pricePerKg(request.getPricePerKg())
                .stockKg(stock)
                .isAvailable(isAvailable)
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .build();

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(request.getName());
        product.setPricePerKg(request.getPricePerKg());
        
        BigDecimal newStock = request.getStockKg() != null ? request.getStockKg() : BigDecimal.ZERO;
        product.setStockKg(newStock);
        product.setIsAvailable(newStock.compareTo(BigDecimal.ZERO) > 0);
        product.setImageUrl(request.getImageUrl());
        product.setDescription(request.getDescription());

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    public List<ProductResponse> getAllAvailableProducts() {
        return productRepository.findAllByIsAvailableTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse updateStock(Long id, BigDecimal newStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (newStock == null || newStock.compareTo(BigDecimal.ZERO) <= 0) {
            product.setStockKg(BigDecimal.ZERO);
            product.setIsAvailable(false);
        } else {
            product.setStockKg(newStock);
            product.setIsAvailable(true);
        }

        Product saved = productRepository.save(product);

        if (saved.getStockKg().compareTo(new BigDecimal("2.0")) <= 0) {
            List<User> owners = userRepository.findByRole(Role.OWNER);
            if (!owners.isEmpty()) {
                String ownerEmail = owners.get(0).getEmail();
                emailService.sendLowStockAlert(ownerEmail, saved.getName(), saved.getStockKg());
            } else {
                log.warn("No owner user found to send low stock alert for product: {}", saved.getName());
            }
        }

        return mapToResponse(saved);
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .pricePerKg(product.getPricePerKg())
                .stockKg(product.getStockKg())
                .isAvailable(product.getIsAvailable())
                .imageUrl(product.getImageUrl())
                .description(product.getDescription())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
