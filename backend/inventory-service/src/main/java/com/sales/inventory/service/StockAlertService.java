package com.sales.inventory.service;

import com.sales.inventory.dto.StockAlertResponse;
import com.sales.inventory.model.StockAlert;

import java.util.List;
import java.util.UUID;

public interface StockAlertService {

    void checkAndCreateAlerts(UUID productId, String sku, UUID warehouseId, Integer currentStock);

    StockAlertResponse resolveAlert(UUID alertId);

    StockAlertResponse ignoreAlert(UUID alertId);

    List<StockAlertResponse> getAlertsByStatus(StockAlert.AlertStatus status);

    List<StockAlertResponse> getAllAlerts();
}
