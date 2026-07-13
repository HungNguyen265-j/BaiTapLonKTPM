package com.btlktpm.shipping.service.carriers;

import com.btlktpm.shipping.dto.ShippingFeeRequest;
import com.btlktpm.shipping.dto.ShippingRequest;
import com.btlktpm.shipping.model.enums.Carrier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class GHTKClient implements CarrierClient {

    private final RestTemplate restTemplate;
    private final String endpoint;
    private final String token;

    public GHTKClient(RestTemplate restTemplate,
                      @Value("${carrier.ghtk.endpoint:https://services.giaohangtietkiem.vn}") String endpoint,
                      @Value("${carrier.ghtk.token:default_token}") String token) {
        this.restTemplate = restTemplate;
        this.endpoint = endpoint;
        this.token = token;
    }

    @Override
    public Carrier getCarrier() {
        return Carrier.GHTK;
    }

    @Override
    public Map<String, Object> createShipment(ShippingRequest request) {
        log.info("Creating GHTK shipment for order: {}", request.getOrderId());
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", "GHTK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        response.put("fee", 25000);
        response.put("estimatedDelivery", "2-4 days");
        response.put("status", "PENDING");
        return response;
    }

    @Override
    public Map<String, Object> trackShipment(String trackingCode) {
        log.info("Tracking GHTK shipment: {}", trackingCode);
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", trackingCode);
        response.put("status", "PICKED_UP");
        response.put("currentLocation", "HCM Warehouse");
        response.put("estimatedDelivery", "2026-07-06");
        return response;
    }

    @Override
    public BigDecimal calculateFee(ShippingFeeRequest request) {
        log.info("Calculating GHTK fee from {} to {} weight {}", request.getFromCity(), request.getToCity(), request.getWeight());
        BigDecimal baseFee = request.getWeight().multiply(BigDecimal.valueOf(4500));
        return baseFee.compareTo(BigDecimal.valueOf(18000)) > 0 ? baseFee : BigDecimal.valueOf(18000);
    }

    @Override
    public Map<String, Object> cancelShipment(String trackingCode) {
        log.info("Cancelling GHTK shipment: {}", trackingCode);
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", trackingCode);
        response.put("status", "CANCELLED");
        return response;
    }
}
