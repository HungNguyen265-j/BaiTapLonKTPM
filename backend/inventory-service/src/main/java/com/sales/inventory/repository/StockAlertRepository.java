package com.sales.inventory.repository;

import com.sales.inventory.model.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, UUID> {

    List<StockAlert> findByStatus(StockAlert.AlertStatus status);

    Optional<StockAlert> findByProductIdAndWarehouseIdAndStatus(UUID productId, UUID warehouseId, StockAlert.AlertStatus status);

    List<StockAlert> findByProductIdAndWarehouseId(UUID productId, UUID warehouseId);
}
