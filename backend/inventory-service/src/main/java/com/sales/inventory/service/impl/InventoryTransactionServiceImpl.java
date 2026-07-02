package com.sales.inventory.service.impl;

import com.sales.inventory.model.InventoryTransaction;
import com.sales.inventory.repository.InventoryTransactionRepository;
import com.sales.inventory.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryTransactionServiceImpl implements InventoryTransactionService {

    private final InventoryTransactionRepository transactionRepository;

    @Override
    public InventoryTransaction recordTransaction(InventoryTransaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public List<InventoryTransaction> getTransactionsByProductId(UUID productId) {
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Override
    public List<InventoryTransaction> getTransactionsByWarehouseId(UUID warehouseId) {
        return transactionRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId);
    }

    @Override
    public List<InventoryTransaction> getTransactionsByReferenceId(String referenceId) {
        return transactionRepository.findByReferenceId(referenceId);
    }

    @Override
    public List<InventoryTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}
