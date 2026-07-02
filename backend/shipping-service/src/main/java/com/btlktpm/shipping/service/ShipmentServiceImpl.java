package com.btlktpm.shipping.service;

import com.btlktpm.shipping.dto.ShippingRequest;
import com.btlktpm.shipping.dto.ShippingResponse;
import com.btlktpm.shipping.dto.TrackingResponse;
import com.btlktpm.shipping.exception.CarrierException;
import com.btlktpm.shipping.exception.ShipmentNotFoundException;
import com.btlktpm.shipping.model.Shipment;
import com.btlktpm.shipping.model.enums.ShipmentStatus;
import com.btlktpm.shipping.repository.ShipmentRepository;
import com.btlktpm.shipping.service.carriers.CarrierClient;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final List<CarrierClient> carrierClients;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public ShippingResponse createShipment(ShippingRequest request) {
        CarrierClient client = resolveCarrierClient(request.getCarrier().name());

        Map<String, Object> carrierResponse;
        try {
            carrierResponse = client.createShipment(request);
        } catch (Exception e) {
            throw new CarrierException("Failed to create shipment with carrier: " + request.getCarrier(), e);
        }

        Shipment shipment = Shipment.builder()
                .orderId(request.getOrderId())
                .orderCode(request.getOrderCode())
                .carrier(request.getCarrier())
                .trackingCode((String) carrierResponse.get("trackingCode"))
                .status(ShipmentStatus.PENDING)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .receiverAddress(request.getReceiverAddress())
                .toCity(request.getToCity())
                .toDistrict(request.getToDistrict())
                .weight(request.getWeight())
                .cod(request.getCod())
                .shippingFee(new BigDecimal(carrierResponse.getOrDefault("fee", "0").toString()))
                .note(request.getNote())
                .carrierData(toJson(carrierResponse))
                .build();

        shipment = shipmentRepository.save(shipment);
        log.info("Shipment created: {} tracking={}", shipment.getId(), shipment.getTrackingCode());
        return toShippingResponse(shipment);
    }

    @Override
    public ShippingResponse getShipmentById(UUID id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found with id: " + id));
        return toShippingResponse(shipment);
    }

    @Override
    public ShippingResponse getShipmentByTrackingCode(String trackingCode) {
        Shipment shipment = shipmentRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found with tracking code: " + trackingCode));
        return toShippingResponse(shipment);
    }

    @Override
    public List<ShippingResponse> getShipmentsByOrderId(UUID orderId) {
        List<Shipment> shipments = shipmentRepository.findByOrderId(orderId);
        return shipments.stream().map(this::toShippingResponse).toList();
    }

    @Override
    public TrackingResponse trackShipment(String trackingCode) {
        Shipment shipment = shipmentRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found: " + trackingCode));

        CarrierClient client = resolveCarrierClient(shipment.getCarrier().name());
        Map<String, Object> trackingData;
        try {
            trackingData = client.trackShipment(trackingCode);
        } catch (Exception e) {
            throw new CarrierException("Failed to track shipment with carrier", e);
        }

        TrackingResponse.TrackingHistoryEntry historyEntry = TrackingResponse.TrackingHistoryEntry.builder()
                .status((String) trackingData.getOrDefault("status", "UNKNOWN"))
                .description("Package at " + trackingData.getOrDefault("currentLocation", "unknown location"))
                .location((String) trackingData.get("currentLocation"))
                .timestamp(LocalDateTime.now())
                .build();

        return TrackingResponse.builder()
                .id(shipment.getId())
                .trackingCode(trackingCode)
                .carrier(shipment.getCarrier())
                .status(shipment.getStatus())
                .receiverName(shipment.getReceiverName())
                .receiverAddress(shipment.getReceiverAddress())
                .toCity(shipment.getToCity())
                .toDistrict(shipment.getToDistrict())
                .fromCity(shipment.getFromCity())
                .fromDistrict(shipment.getFromDistrict())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .actualDelivery(shipment.getActualDelivery())
                .history(List.of(historyEntry))
                .build();
    }

    @Override
    @Transactional
    public ShippingResponse updateShipmentStatus(UUID id, ShipmentStatus status, String carrierData) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found: " + id));
        shipment.setStatus(status);
        if (status == ShipmentStatus.DELIVERED) {
            shipment.setActualDelivery(LocalDateTime.now());
        }
        if (carrierData != null) {
            shipment.setCarrierData(carrierData);
        }
        shipment = shipmentRepository.save(shipment);
        log.info("Shipment {} status updated to {}", id, status);
        return toShippingResponse(shipment);
    }

    @Override
    public List<ShippingResponse> getShipmentsByStatus(ShipmentStatus status) {
        return shipmentRepository.findByStatus(status).stream()
                .map(this::toShippingResponse)
                .toList();
    }

    private CarrierClient resolveCarrierClient(String carrierName) {
        return carrierClients.stream()
                .filter(c -> c.getCarrier().name().equalsIgnoreCase(carrierName))
                .findFirst()
                .orElseThrow(() -> new CarrierException("No client found for carrier: " + carrierName));
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize carrier data", e);
            return "{}";
        }
    }

    private ShippingResponse toShippingResponse(Shipment shipment) {
        return ShippingResponse.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .orderCode(shipment.getOrderCode())
                .carrier(shipment.getCarrier())
                .trackingCode(shipment.getTrackingCode())
                .status(shipment.getStatus())
                .shippingFee(shipment.getShippingFee())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .actualDelivery(shipment.getActualDelivery())
                .note(shipment.getNote())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .build();
    }
}
