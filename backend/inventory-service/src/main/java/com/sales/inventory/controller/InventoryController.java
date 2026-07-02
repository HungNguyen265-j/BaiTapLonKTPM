package com.sales.inventory.controller;

import com.sales.inventory.dto.InventoryRequest;
import com.sales.inventory.dto.InventoryResponse;
import com.sales.inventory.dto.InventoryTransferRequest;
import com.sales.inventory.dto.StockAlertResponse;
import com.sales.inventory.model.Inventory;
import com.sales.inventory.model.InventoryTransaction;
import com.sales.inventory.model.StockAlert;
import com.sales.inventory.repository.InventoryRepository;
import com.sales.inventory.service.InventoryService;
import com.sales.inventory.service.InventoryTransactionService;
import com.sales.inventory.service.StockAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryTransactionService transactionService;
    private final StockAlertService stockAlertService;
    private final InventoryRepository inventoryRepository;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventories() {
        return ResponseEntity.ok(inventoryService.getAllInventories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<List<InventoryResponse>> getByProductId(@PathVariable UUID productId) {
        return ResponseEntity.ok(inventoryService.getByProductId(productId));
    }

    @GetMapping("/products/{productId}/warehouses/{warehouseId}")
    public ResponseEntity<InventoryResponse> getByProductAndWarehouse(
            @PathVariable UUID productId, @PathVariable UUID warehouseId) {
        return ResponseEntity.ok(inventoryService.getByProductAndWarehouse(productId, warehouseId));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<List<InventoryResponse>> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(inventoryService.getBySku(sku));
    }

    @GetMapping("/warehouses/{warehouseId}/stock")
    public ResponseEntity<List<InventoryResponse>> getByWarehouseId(@PathVariable UUID warehouseId) {
        return ResponseEntity.ok(inventoryService.getByWarehouseId(warehouseId));
    }

    @PutMapping
    public ResponseEntity<InventoryResponse> createOrUpdateInventory(@Valid @RequestBody InventoryRequest request) {
        Inventory inventory = Inventory.builder()
                .productId(request.getProductId())
                .sku(request.getSku())
                .warehouseId(request.getWarehouseId())
                .quantityOnHand(request.getQuantity())
                .quantityReserved(0)
                .build();

        var existing = inventoryRepository.findByProductIdAndWarehouseId(
                request.getProductId(), request.getWarehouseId());
        if (existing.isPresent()) {
            Inventory inv = existing.get();
            inv.setQuantityOnHand(inv.getQuantityOnHand() + request.getQuantity());
            return ResponseEntity.ok(inventoryService.updateInventory(inv.getId(), inv));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createInventory(inventory));
    }

    @PostMapping("/adjust")
    public ResponseEntity<InventoryResponse> adjustStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(
                request.getProductId(), request.getSku(), request.getWarehouseId(),
                request.getQuantity(), "Manual adjustment"));
    }

    @PostMapping("/reserve")
    public ResponseEntity<InventoryResponse> reserveStock(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.reserveStock(
                request.getProductId(), request.getSku(), request.getWarehouseId(), request.getQuantity()));
    }

    @PostMapping("/release")
    public ResponseEntity<InventoryResponse> releaseReservation(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.releaseReservation(
                request.getProductId(), request.getSku(), request.getWarehouseId(), request.getQuantity()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<InventoryResponse> transferStock(@Valid @RequestBody InventoryTransferRequest request) {
        return ResponseEntity.ok(inventoryService.transferStock(request));
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam UUID productId, @RequestParam UUID warehouseId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.checkAvailability(productId, warehouseId, quantity));
    }

    @GetMapping("/transactions/product/{productId}")
    public ResponseEntity<List<InventoryTransaction>> getProductTransactions(@PathVariable UUID productId) {
        return ResponseEntity.ok(transactionService.getTransactionsByProductId(productId));
    }

    @GetMapping("/transactions/warehouse/{warehouseId}")
    public ResponseEntity<List<InventoryTransaction>> getWarehouseTransactions(@PathVariable UUID warehouseId) {
        return ResponseEntity.ok(transactionService.getTransactionsByWarehouseId(warehouseId));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<StockAlertResponse>> getAlerts(
            @RequestParam(required = false) StockAlert.AlertStatus status) {
        if (status != null) {
            return ResponseEntity.ok(stockAlertService.getAlertsByStatus(status));
        }
        return ResponseEntity.ok(stockAlertService.getAllAlerts());
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<StockAlertResponse> resolveAlert(@PathVariable UUID id) {
        return ResponseEntity.ok(stockAlertService.resolveAlert(id));
    }

    @PostMapping("/alerts/{id}/ignore")
    public ResponseEntity<StockAlertResponse> ignoreAlert(@PathVariable UUID id) {
        return ResponseEntity.ok(stockAlertService.ignoreAlert(id));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }
}
