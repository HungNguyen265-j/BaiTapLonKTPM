package com.sales.order.repository;

import com.sales.order.model.Order;
import com.sales.order.model.Order.OrderSource;
import com.sales.order.model.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByCustomerId(UUID customerId);

    List<Order> findBySource(OrderSource source);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query(value = "SELECT o.* FROM orders o " +
           "LEFT JOIN order_items oi ON oi.order_id = o.id " +
           "WHERE (:keyword IS NULL OR o.order_code ILIKE %:keyword% " +
           "   OR o.customer_name ILIKE %:keyword% " +
           "   OR o.customer_email ILIKE %:keyword% " +
           "   OR oi.product_name ILIKE %:keyword%) " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:source IS NULL OR o.source = :source) " +
           "AND (:customerId IS NULL OR o.customer_id = :customerId) " +
           "AND (:startDate IS NULL OR o.created_at >= :startDate) " +
           "AND (:endDate IS NULL OR o.created_at <= :endDate) " +
           "ORDER BY o.created_at DESC", nativeQuery = true)
    List<Order> searchOrders(@Param("keyword") String keyword,
                             @Param("status") String status,
                             @Param("source") String source,
                             @Param("customerId") String customerId,
                             @Param("startDate") LocalDateTime startDate,
                             @Param("endDate") LocalDateTime endDate);
}
