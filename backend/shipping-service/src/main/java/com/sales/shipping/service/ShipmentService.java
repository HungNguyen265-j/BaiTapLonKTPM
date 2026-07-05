package com.sales.shipping.service;

import com.sales.shipping.dto.ShippingRequest;
import com.sales.shipping.dto.ShippingResponse;
import com.sales.shipping.dto.TrackingResponse;
import com.sales.shipping.model.Shipment;
import com.sales.shipping.model.enums.ShipmentStatus;

import java.util.List;
import java.util.UUID;

public interface ShipmentService {

    ShippingResponse createShipment(ShippingRequest request);

    ShippingResponse getShipmentById(UUID id);

    ShippingResponse getShipmentByTrackingCode(String trackingCode);

    List<ShippingResponse> getShipmentsByOrderId(UUID orderId);

    TrackingResponse trackShipment(String trackingCode);

    ShippingResponse updateShipmentStatus(UUID id, ShipmentStatus status, String carrierData);

    List<ShippingResponse> getShipmentsByStatus(ShipmentStatus status);
}
