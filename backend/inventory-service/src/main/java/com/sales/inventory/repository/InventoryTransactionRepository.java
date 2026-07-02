package com.sales.inventory.repository;

import com.sales.inventory.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID> {

    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(UUID productId);

    List<InventoryTransaction> findByWarehouseIdOrderByCreatedAtDesc(UUID warehouseId);

    List<InventoryTransaction> findByReferenceId(String referenceId);
}
