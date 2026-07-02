package com.sales.inventory.service.impl;

import com.sales.inventory.dto.InventoryResponse;
import com.sales.inventory.dto.InventoryTransferRequest;
import com.sales.inventory.event.InventoryReservedEvent;
import com.sales.inventory.event.StockAdjustedEvent;
import com.sales.inventory.exception.InsufficientStockException;
import com.sales.inventory.exception.InventoryNotFoundException;
import com.sales.inventory.model.Inventory;
import com.sales.inventory.model.InventoryTransaction;
import com.sales.inventory.repository.InventoryRepository;
import com.sales.inventory.service.InventoryCacheService;
import com.sales.inventory.service.InventoryService;
import com.sales.inventory.service.InventoryTransactionService;
import com.sales.inventory.service.StockAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionService transactionService;
    private final InventoryCacheService cacheService;
    private final StockAlertService stockAlertService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public InventoryResponse createInventory(Inventory inventory) {
        inventory.setQuantityAvailable(inventory.getQuantityOnHand() - inventory.getQuantityReserved());
        Inventory saved = inventoryRepository.save(inventory);

        InventoryResponse response = InventoryResponse.fromEntity(saved);
        cacheService.cacheInventory(response);
        return response;
    }

    @Override
    @Transactional
    public InventoryResponse updateInventory(UUID id, Inventory inventory) {
        Inventory existing = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with id: " + id));

        existing.setQuantityOnHand(inventory.getQuantityOnHand());
        existing.setQuantityReserved(inventory.getQuantityReserved());
        existing.setReorderPoint(inventory.getReorderPoint());
        existing.setReorderQuantity(inventory.getReorderQuantity());
        existing.setLocationBin(inventory.getLocationBin());
        existing.setStatus(inventory.getStatus());

        Inventory saved = inventoryRepository.save(existing);
        InventoryResponse response = InventoryResponse.fromEntity(saved);
        cacheService.cacheInventory(response);
        return response;
    }

    @Override
    public InventoryResponse getInventoryById(UUID id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with id: " + id));
        return InventoryResponse.fromEntity(inventory);
    }

    @Override
    public InventoryResponse getByProductAndWarehouse(UUID productId, UUID warehouseId) {
        Optional<InventoryResponse> cached = cacheService.getCachedInventory(productId, warehouseId);
        if (cached.isPresent()) {
            return cached.get();
        }
        Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new InventoryNotFoundException(productId, warehouseId));
        InventoryResponse response = InventoryResponse.fromEntity(inventory);
        cacheService.cacheInventory(response);
        return response;
    }

    @Override
    public List<InventoryResponse> getByProductId(UUID productId) {
        return inventoryRepository.findByProductId(productId).stream()
                .map(InventoryResponse::fromEntity)
                .toList();
    }

    @Override
    public List<InventoryResponse> getBySku(String sku) {
        return inventoryRepository.findBySku(sku).stream()
                .map(InventoryResponse::fromEntity)
                .toList();
    }

    @Override
    public List<InventoryResponse> getByWarehouseId(UUID warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId).stream()
                .map(InventoryResponse::fromEntity)
                .toList();
    }

    @Override
    public List<InventoryResponse> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(InventoryResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public InventoryResponse adjustStock(UUID productId, String sku, UUID warehouseId, Integer quantity, String reason) {
        Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new InventoryNotFoundException(productId, warehouseId));

        Integer oldQuantity = inventory.getQuantityOnHand();
        int newQuantity = oldQuantity + quantity;
        if (newQuantity < 0) {
            throw new InsufficientStockException(sku, quantity, oldQuantity);
        }

        inventory.setQuantityOnHand(newQuantity);
        Inventory saved = inventoryRepository.save(inventory);
        InventoryResponse response = InventoryResponse.fromEntity(saved);
        cacheService.cacheInventory(response);
        cacheService.evictInventoryCache(productId, warehouseId);

        StockAdjustedEvent event = StockAdjustedEvent.create(
                productId, sku, warehouseId, oldQuantity, newQuantity, reason);
        kafkaTemplate.send("inventory-events", event);

        InventoryTransaction tx = InventoryTransaction.builder()
                .productId(productId)
                .sku(sku)
                .warehouseId(warehouseId)
                .transactionType(quantity >= 0 ? InventoryTransaction.TransactionType.INBOUND
                        : InventoryTransaction.TransactionType.OUTBOUND)
                .quantity(Math.abs(quantity))
                .referenceType(InventoryTransaction.ReferenceType.ADJUSTMENT)
                .note(reason)
                .build();
        transactionService.recordTransaction(tx);

        stockAlertService.checkAndCreateAlerts(productId, sku, warehouseId, newQuantity);

        return response;
    }

    @Override
    @Transactional
    public InventoryResponse reserveStock(UUID productId, String sku, UUID warehouseId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new InventoryNotFoundException(productId, warehouseId));

        int available = inventory.getQuantityOnHand() - inventory.getQuantityReserved();
        if (available < quantity) {
            InventoryReservedEvent failEvent = InventoryReservedEvent.create(
                    productId, sku, warehouseId, quantity, null, false);
            kafkaTemplate.send("inventory-events", failEvent);
            throw new InsufficientStockException(sku, quantity, available);
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);
        Inventory saved = inventoryRepository.save(inventory);
        InventoryResponse response = InventoryResponse.fromEntity(saved);
        cacheService.cacheInventory(response);

        InventoryReservedEvent successEvent = InventoryReservedEvent.create(
                productId, sku, warehouseId, quantity, null, true);
        kafkaTemplate.send("inventory-events", successEvent);

        InventoryTransaction tx = InventoryTransaction.builder()
                .productId(productId)
                .sku(sku)
                .warehouseId(warehouseId)
                .transactionType(InventoryTransaction.TransactionType.RESERVATION)
                .quantity(quantity)
                .referenceType(InventoryTransaction.ReferenceType.ORDER)
                .note("Stock reserved")
                .build();
        transactionService.recordTransaction(tx);

        stockAlertService.checkAndCreateAlerts(productId, sku, warehouseId,
                saved.getQuantityOnHand() - saved.getQuantityReserved());

        return response;
    }

    @Override
    @Transactional
    public InventoryResponse releaseReservation(UUID productId, String sku, UUID warehouseId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new InventoryNotFoundException(productId, warehouseId));

        int newReserved = inventory.getQuantityReserved() - quantity;
        if (newReserved < 0) {
            newReserved = 0;
        }
        inventory.setQuantityReserved(newReserved);
        Inventory saved = inventoryRepository.save(inventory);
        InventoryResponse response = InventoryResponse.fromEntity(saved);
        cacheService.cacheInventory(response);

        InventoryTransaction tx = InventoryTransaction.builder()
                .productId(productId)
                .sku(sku)
                .warehouseId(warehouseId)
                .transactionType(InventoryTransaction.TransactionType.RELEASE)
                .quantity(quantity)
                .referenceType(InventoryTransaction.ReferenceType.ORDER)
                .note("Reservation released")
                .build();
        transactionService.recordTransaction(tx);

        return response;
    }

    @Override
    @Transactional
    public InventoryResponse transferStock(InventoryTransferRequest request) {
        adjustStock(request.getProductId(), request.getSku(), request.getFromWarehouseId(),
                -request.getQuantity(), "Transfer out to warehouse: " + request.getToWarehouseId());

        adjustStock(request.getProductId(), request.getSku(), request.getToWarehouseId(),
                request.getQuantity(), "Transfer in from warehouse: " + request.getFromWarehouseId());

        Inventory inventory = inventoryRepository
                .findByProductIdAndWarehouseId(request.getProductId(), request.getToWarehouseId())
                .orElseThrow(() -> new InventoryNotFoundException(request.getProductId(), request.getToWarehouseId()));

        InventoryTransaction tx = InventoryTransaction.builder()
                .productId(request.getProductId())
                .sku(request.getSku())
                .warehouseId(request.getFromWarehouseId())
                .transactionType(InventoryTransaction.TransactionType.OUTBOUND)
                .quantity(request.getQuantity())
                .referenceType(InventoryTransaction.ReferenceType.ADJUSTMENT)
                .note("Transfer to " + request.getToWarehouseId() + ": " + request.getNote())
                .build();
        transactionService.recordTransaction(tx);

        return InventoryResponse.fromEntity(inventory);
    }

    @Override
    public boolean checkAvailability(UUID productId, UUID warehouseId, Integer quantity) {
        try {
            InventoryResponse inventory = getByProductAndWarehouse(productId, warehouseId);
            return inventory.getQuantityAvailable() >= quantity;
        } catch (InventoryNotFoundException e) {
            return false;
        }
    }

    @Override
    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStockProducts().stream()
                .map(InventoryResponse::fromEntity)
                .toList();
    }
}
