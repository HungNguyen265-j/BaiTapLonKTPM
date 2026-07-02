package com.btlktpm.shipping.controller;

import com.btlktpm.shipping.dto.*;
import com.btlktpm.shipping.service.ShipmentService;
import com.btlktpm.shipping.service.ShippingFeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShipmentService shipmentService;
    private final ShippingFeeService shippingFeeService;

    @PostMapping("/create")
    public ResponseEntity<ShippingResponse> createShipment(@Valid @RequestBody ShippingRequest request) {
        ShippingResponse response = shipmentService.createShipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShippingResponse> getShipmentById(@PathVariable UUID id) {
        ShippingResponse response = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/track/{trackingCode}")
    public ResponseEntity<TrackingResponse> trackShipment(@PathVariable String trackingCode) {
        TrackingResponse response = shipmentService.trackShipment(trackingCode);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<ShippingResponse>> getShipmentsByOrderId(@PathVariable UUID orderId) {
        List<ShippingResponse> responses = shipmentService.getShipmentsByOrderId(orderId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/fee/calculate")
    public ResponseEntity<ShippingFeeResponse> calculateFee(@Valid @RequestBody ShippingFeeRequest request) {
        ShippingFeeResponse response = shippingFeeService.calculateFee(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fee/calculate-all")
    public ResponseEntity<ShippingFeeResponse> calculateAllFees(@Valid @RequestBody ShippingFeeRequest request) {
        ShippingFeeResponse response = shippingFeeService.calculateAllFees(request);
        return ResponseEntity.ok(response);
    }
}
