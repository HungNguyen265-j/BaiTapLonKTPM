package com.sales.shipping.controller;

import com.sales.shipping.dto.CarrierConfigRequest;
import com.sales.shipping.model.CarrierConfig;
import com.sales.shipping.model.enums.Carrier;
import com.sales.shipping.service.CarrierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipping/carriers")
@RequiredArgsConstructor
public class CarrierConfigController {

    private final CarrierService carrierService;

    @GetMapping
    public ResponseEntity<List<CarrierConfig>> getAllConfigs() {
        return ResponseEntity.ok(carrierService.getAllConfigs());
    }

    @GetMapping("/{carrier}")
    public ResponseEntity<CarrierConfig> getConfig(@PathVariable Carrier carrier) {
        CarrierConfig config = carrierService.getConfig(carrier);
        if (config == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(config);
    }

    @PostMapping
    public ResponseEntity<CarrierConfig> createConfig(@Valid @RequestBody CarrierConfigRequest request) {
        CarrierConfig config = carrierService.saveConfig(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(config);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarrierConfig> updateConfig(@PathVariable UUID id,
                                                       @Valid @RequestBody CarrierConfigRequest request) {
        CarrierConfig config = carrierService.updateConfig(id, request);
        return ResponseEntity.ok(config);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfig(@PathVariable UUID id) {
        carrierService.deleteConfig(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    public ResponseEntity<List<CarrierConfig>> getActiveConfigs() {
        return ResponseEntity.ok(carrierService.getActiveConfigs());
    }
}
