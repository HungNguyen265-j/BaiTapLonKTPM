package com.sales.shipping.repository;

import com.sales.shipping.model.Shipment;
import com.sales.shipping.model.enums.Carrier;
import com.sales.shipping.model.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    List<Shipment> findByOrderId(UUID orderId);

    Optional<Shipment> findByTrackingCode(String trackingCode);

    List<Shipment> findByCarrierAndStatus(Carrier carrier, ShipmentStatus status);

    List<Shipment> findByStatus(ShipmentStatus status);

    List<Shipment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
