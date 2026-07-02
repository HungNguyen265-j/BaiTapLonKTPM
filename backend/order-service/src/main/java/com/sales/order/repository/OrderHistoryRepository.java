package com.sales.order.repository;

import com.sales.order.model.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, UUID> {

    List<OrderHistory> findByOrderIdOrderByCreatedAtDesc(UUID orderId);
}
