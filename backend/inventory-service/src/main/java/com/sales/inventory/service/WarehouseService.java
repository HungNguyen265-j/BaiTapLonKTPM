package com.sales.inventory.service;

import com.sales.inventory.model.Warehouse;

import java.util.List;
import java.util.UUID;

public interface WarehouseService {

    Warehouse createWarehouse(Warehouse warehouse);

    Warehouse updateWarehouse(UUID id, Warehouse warehouse);

    Warehouse getWarehouseById(UUID id);

    Warehouse getWarehouseByCode(String code);

    List<Warehouse> getAllWarehouses();

    List<Warehouse> getWarehousesByStatus(Warehouse.WarehouseStatus status);

    void deleteWarehouse(UUID id);
}
