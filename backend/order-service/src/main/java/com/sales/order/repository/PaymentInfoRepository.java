package com.sales.order.repository;

import com.sales.order.model.PaymentInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentInfoRepository extends JpaRepository<PaymentInfo, UUID> {

    List<PaymentInfo> findByOrderId(UUID orderId);

    Optional<PaymentInfo> findByTransactionId(String transactionId);

    List<PaymentInfo> findByStatus(String status);
}
