package com.sales.inventory.controller;

import com.sales.inventory.model.Warehouse;
import com.sales.inventory.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@Valid @RequestBody Warehouse warehouse) {
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseService.createWarehouse(warehouse));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable UUID id, @Valid @RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, warehouse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable UUID id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Warehouse> getWarehouseByCode(@PathVariable String code) {
        return ResponseEntity.ok(warehouseService.getWarehouseByCode(code));
    }

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses(
            @RequestParam(required = false) Warehouse.WarehouseStatus status) {
        if (status != null) {
            return ResponseEntity.ok(warehouseService.getWarehousesByStatus(status));
        }
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable UUID id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }
}
