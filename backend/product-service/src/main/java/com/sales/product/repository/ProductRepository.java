package com.sales.product.repository;

import com.sales.product.model.Product;
import com.sales.product.model.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByCategoryId(UUID categoryId);

    List<Product> findByStatus(ProductStatus status);

    @Query(value = "SELECT p.* FROM products p " +
           "WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) " +
           "@@ to_tsquery('english', :keyword)", nativeQuery = true)
    List<Product> searchProducts(@Param("keyword") String keyword);
}
