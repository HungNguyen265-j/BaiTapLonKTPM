package com.sales.inventory.service.impl;

import com.sales.inventory.dto.StockAlertResponse;
import com.sales.inventory.event.LowStockEvent;
import com.sales.inventory.exception.InventoryNotFoundException;
import com.sales.inventory.model.Inventory;
import com.sales.inventory.model.StockAlert;
import com.sales.inventory.repository.InventoryRepository;
import com.sales.inventory.repository.StockAlertRepository;
import com.sales.inventory.service.StockAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockAlertServiceImpl implements StockAlertService {

    private final StockAlertRepository alertRepository;
    private final InventoryRepository inventoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.alert.low-stock-threshold}")
    private Integer lowStockThreshold;

    @Override
    @Transactional
    public void checkAndCreateAlerts(UUID productId, String sku, UUID warehouseId, Integer currentStock) {
        Optional<Inventory> inventoryOpt = inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId);
        if (inventoryOpt.isEmpty()) return;

        Inventory inventory = inventoryOpt.get();
        Integer reorderPoint = inventory.getReorderPoint() != null ? inventory.getReorderPoint() : lowStockThreshold;

        StockAlert.AlertType alertType = null;
        if (currentStock <= 0) {
            alertType = StockAlert.AlertType.OUT_OF_STOCK;
        } else if (currentStock <= reorderPoint) {
            alertType = StockAlert.AlertType.LOW_STOCK;
        }

        if (alertType != null) {
            Optional<StockAlert> existingAlert = alertRepository
                    .findByProductIdAndWarehouseIdAndStatus(productId, warehouseId, StockAlert.AlertStatus.PENDING);
            if (existingAlert.isEmpty()) {
                StockAlert alert = StockAlert.builder()
                        .productId(productId)
                        .sku(sku)
                        .warehouseId(warehouseId)
                        .alertType(alertType)
                        .threshold(reorderPoint)
                        .currentQuantity(currentStock)
                        .status(StockAlert.AlertStatus.PENDING)
                        .build();
                alertRepository.save(alert);

                LowStockEvent event = LowStockEvent.create(
                        productId, sku, warehouseId, currentStock, reorderPoint, alertType.name());
                kafkaTemplate.send("low-stock-alerts", event);
                log.info("Low stock alert created for SKU: {} in warehouse: {}", sku, warehouseId);
            }
        }
    }

    @Override
    @Transactional
    public StockAlertResponse resolveAlert(UUID alertId) {
        StockAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new InventoryNotFoundException("Stock alert not found with id: " + alertId));
        alert.setStatus(StockAlert.AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        return StockAlertResponse.fromEntity(alertRepository.save(alert));
    }

    @Override
    @Transactional
    public StockAlertResponse ignoreAlert(UUID alertId) {
        StockAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new InventoryNotFoundException("Stock alert not found with id: " + alertId));
        alert.setStatus(StockAlert.AlertStatus.IGNORED);
        alert.setResolvedAt(LocalDateTime.now());
        return StockAlertResponse.fromEntity(alertRepository.save(alert));
    }

    @Override
    public List<StockAlertResponse> getAlertsByStatus(StockAlert.AlertStatus status) {
        return alertRepository.findByStatus(status).stream()
                .map(StockAlertResponse::fromEntity)
                .toList();
    }

    @Override
    public List<StockAlertResponse> getAllAlerts() {
        return alertRepository.findAll().stream()
                .map(StockAlertResponse::fromEntity)
                .toList();
    }
}
