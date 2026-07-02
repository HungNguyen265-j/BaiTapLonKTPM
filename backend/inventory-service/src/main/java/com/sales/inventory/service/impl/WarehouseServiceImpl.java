package com.sales.inventory.service.impl;

import com.sales.inventory.exception.InventoryNotFoundException;
import com.sales.inventory.model.Warehouse;
import com.sales.inventory.repository.WarehouseRepository;
import com.sales.inventory.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Override
    @Transactional
    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    @Override
    @Transactional
    public Warehouse updateWarehouse(UUID id, Warehouse warehouse) {
        Warehouse existing = getWarehouseById(id);
        existing.setName(warehouse.getName());
        existing.setCode(warehouse.getCode());
        existing.setAddress(warehouse.getAddress());
        existing.setCity(warehouse.getCity());
        existing.setDistrict(warehouse.getDistrict());
        existing.setWard(warehouse.getWard());
        existing.setContactPerson(warehouse.getContactPerson());
        existing.setContactPhone(warehouse.getContactPhone());
        existing.setStatus(warehouse.getStatus());
        return warehouseRepository.save(existing);
    }

    @Override
    public Warehouse getWarehouseById(UUID id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException("Warehouse not found with id: " + id));
    }

    @Override
    public Warehouse getWarehouseByCode(String code) {
        return warehouseRepository.findByCode(code)
                .orElseThrow(() -> new InventoryNotFoundException("Warehouse not found with code: " + code));
    }

    @Override
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @Override
    public List<Warehouse> getWarehousesByStatus(Warehouse.WarehouseStatus status) {
        return warehouseRepository.findByStatus(status);
    }

    @Override
    @Transactional
    public void deleteWarehouse(UUID id) {
        Warehouse warehouse = getWarehouseById(id);
        warehouseRepository.delete(warehouse);
    }
}
