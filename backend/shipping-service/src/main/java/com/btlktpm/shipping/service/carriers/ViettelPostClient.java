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
public class ViettelPostClient implements CarrierClient {

    private final RestTemplate restTemplate;
    private final String endpoint;
    private final String token;

    public ViettelPostClient(RestTemplate restTemplate,
                             @Value("${carrier.viettelpost.endpoint:https://viettelpost.com.vn/api}") String endpoint,
                             @Value("${carrier.viettelpost.token:default_token}") String token) {
        this.restTemplate = restTemplate;
        this.endpoint = endpoint;
        this.token = token;
    }

    @Override
    public Carrier getCarrier() {
        return Carrier.VIETTEL_POST;
    }

    @Override
    public Map<String, Object> createShipment(ShippingRequest request) {
        log.info("Creating ViettelPost shipment for order: {}", request.getOrderId());
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", "VTP" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        response.put("fee", 28000);
        response.put("estimatedDelivery", "1-3 days");
        response.put("status", "PENDING");
        return response;
    }

    @Override
    public Map<String, Object> trackShipment(String trackingCode) {
        log.info("Tracking ViettelPost shipment: {}", trackingCode);
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", trackingCode);
        response.put("status", "DELIVERED");
        response.put("currentLocation", "Hai Ba Trung Post Office");
        response.put("estimatedDelivery", "2026-07-03");
        return response;
    }

    @Override
    public BigDecimal calculateFee(ShippingFeeRequest request) {
        log.info("Calculating ViettelPost fee from {} to {} weight {}", request.getFromCity(), request.getToCity(), request.getWeight());
        BigDecimal baseFee = request.getWeight().multiply(BigDecimal.valueOf(4200));
        return baseFee.compareTo(BigDecimal.valueOf(16000)) > 0 ? baseFee : BigDecimal.valueOf(16000);
    }

    @Override
    public Map<String, Object> cancelShipment(String trackingCode) {
        log.info("Cancelling ViettelPost shipment: {}", trackingCode);
        Map<String, Object> response = new HashMap<>();
        response.put("trackingCode", trackingCode);
        response.put("status", "CANCELLED");
        return response;
    }
}
