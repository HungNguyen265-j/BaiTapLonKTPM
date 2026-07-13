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
public class GHNClient implements CarrierClient {

    private final RestTemplate restTemplate;
    private final String endpoint;
    private final String token;

    public GHNClient(RestTemplate restTemplate,
                     @Value("${carrier.ghn.endpoint:https://dev-online-gateway.ghn.vn/shipping}") String endpoint,
                     @Value("${carrier.ghn.token:default_token}") String token) {
        this.restTemplate = restTemplate;
        this.endpoint = endpoint;
        this.token = token;
    }

    @Override
    public Carrier getCarrier() {
        return Carrier.GHN;
    }

    @Override
    public Map<String, Object> createShipment(ShippingRequest request) {
        log.info("Creating GHN shipment for order: {}", request.getOrderId());
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", "GHN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        response.put("fee", 30000);
        response.put("estimatedDelivery", "2-3 days");
        response.put("status", "PENDING");
        return response;
    }

    @Override
    public Map<String, Object> trackShipment(String trackingCode) {
        log.info("Tracking GHN shipment: {}", trackingCode);
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", trackingCode);
        response.put("status", "IN_TRANSIT");
        response.put("currentLocation", "HN Sorting Center");
        response.put("estimatedDelivery", "2026-07-05");
        return response;
    }

    @Override
    public BigDecimal calculateFee(ShippingFeeRequest request) {
        log.info("Calculating GHN fee from {} to {} weight {}", request.getFromCity(), request.getToCity(), request.getWeight());
        BigDecimal baseFee = request.getWeight().multiply(BigDecimal.valueOf(5000));
        return baseFee.compareTo(BigDecimal.valueOf(20000)) > 0 ? baseFee : BigDecimal.valueOf(20000);
    }

    @Override
    public Map<String, Object> cancelShipment(String trackingCode) {
        log.info("Cancelling GHN shipment: {}", trackingCode);
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", trackingCode);
        response.put("status", "CANCELLED");
        return response;
    }
}
