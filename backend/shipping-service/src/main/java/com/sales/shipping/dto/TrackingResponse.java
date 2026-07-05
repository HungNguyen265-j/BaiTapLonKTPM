package com.sales.shipping.dto;

import com.sales.shipping.model.enums.Carrier;
import com.sales.shipping.model.enums.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingResponse {

    private UUID id;
    private String trackingCode;
    private Carrier carrier;
    private ShipmentStatus status;
    private String receiverName;
    private String receiverAddress;
    private String toCity;
    private String toDistrict;
    private String fromCity;
    private String fromDistrict;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime actualDelivery;
    private List<TrackingHistoryEntry> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrackingHistoryEntry {
        private String status;
        private String description;
        private String location;
        private LocalDateTime timestamp;
    }
}
