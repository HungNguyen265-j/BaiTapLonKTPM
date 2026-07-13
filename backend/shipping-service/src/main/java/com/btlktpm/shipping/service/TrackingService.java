package com.btlktpm.shipping.service;

import com.btlktpm.shipping.dto.TrackingResponse;
import com.btlktpm.shipping.exception.CarrierException;
import com.btlktpm.shipping.exception.ShipmentNotFoundException;
import com.btlktpm.shipping.model.Shipment;
import com.btlktpm.shipping.model.enums.ShipmentStatus;
import com.btlktpm.shipping.repository.ShipmentRepository;
import com.btlktpm.shipping.service.carriers.CarrierClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ShipmentRepository shipmentRepository;
    private final List<CarrierClient> carrierClients;

    public TrackingResponse trackByCode(String trackingCode) {
        Shipment shipment = shipmentRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found: " + trackingCode));

        CarrierClient client = resolveClient(shipment.getCarrier().name());
        Map<String, Object> data;
        try {
            data = client.trackShipment(trackingCode);
        } catch (Exception e) {
            throw new CarrierException("Failed to fetch tracking from carrier", e);
        }

        List<TrackingResponse.TrackingHistoryEntry> history = new ArrayList<>();
        history.add(TrackingResponse.TrackingHistoryEntry.builder()
                .status((String) data.getOrDefault("status", "UNKNOWN"))
                .description("Location: " + data.getOrDefault("currentLocation", "N/A"))
                .location((String) data.get("currentLocation"))
                .timestamp(LocalDateTime.now())
                .build());

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
                .history(history)
                .build();
    }

    public List<TrackingResponse> trackByOrderId(String orderId) {
        List<Shipment> shipments = shipmentRepository.findByOrderId(java.util.UUID.fromString(orderId));
        if (shipments.isEmpty()) {
            throw new ShipmentNotFoundException("No shipments found for order: " + orderId);
        }
        return shipments.stream().map(s -> {
            try {
                return trackByCode(s.getTrackingCode());
            } catch (Exception e) {
                log.warn("Failed to track shipment {}", s.getTrackingCode(), e);
                return null;
            }
        }).filter(java.util.Objects::nonNull).toList();
    }

    private CarrierClient resolveClient(String carrierName) {
        return carrierClients.stream()
                .filter(c -> c.getCarrier().name().equalsIgnoreCase(carrierName))
                .findFirst()
                .orElseThrow(() -> new CarrierException("No client for carrier: " + carrierName));
    }
}
