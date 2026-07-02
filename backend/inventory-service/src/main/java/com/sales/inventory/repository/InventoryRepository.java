package com.sales.inventory.repository;

import com.sales.inventory.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    List<Inventory> findByProductId(UUID productId);

    Optional<Inventory> findBySkuAndWarehouseId(String sku, UUID warehouseId);

    List<Inventory> findByWarehouseId(UUID warehouseId);

    List<Inventory> findByQuantityAvailableLessThanAndStatus(Integer quantity, Inventory.InventoryStatus status);

    @Query("SELECT i FROM Inventory i WHERE i.quantityOnHand <= i.reorderPoint AND i.status = 'ACTIVE'")
    List<Inventory> findLowStockProducts();

    Optional<Inventory> findByProductIdAndWarehouseId(UUID productId, UUID warehouseId);

    List<Inventory> findBySku(String sku);
}
