package com.btlktpm.shipping.service;

import com.btlktpm.shipping.dto.ShippingRequest;
import com.btlktpm.shipping.dto.ShippingResponse;
import com.btlktpm.shipping.dto.TrackingResponse;
import com.btlktpm.shipping.model.Shipment;
import com.btlktpm.shipping.model.enums.ShipmentStatus;

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
