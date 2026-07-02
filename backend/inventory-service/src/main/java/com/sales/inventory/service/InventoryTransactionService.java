package com.sales.inventory.service;

import com.sales.inventory.model.InventoryTransaction;

import java.util.List;
import java.util.UUID;

public interface InventoryTransactionService {

    InventoryTransaction recordTransaction(InventoryTransaction transaction);

    List<InventoryTransaction> getTransactionsByProductId(UUID productId);

    List<InventoryTransaction> getTransactionsByWarehouseId(UUID warehouseId);

    List<InventoryTransaction> getTransactionsByReferenceId(String referenceId);

    List<InventoryTransaction> getAllTransactions();
}
