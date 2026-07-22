package com.laddukadai.backend.repository;

import com.laddukadai.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByIsAvailableTrue();

    List<Product> findByStockKgLessThanEqual(BigDecimal threshold);
}
