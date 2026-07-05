package com.sales.shipping.service.carriers;

import com.sales.shipping.dto.ShippingFeeRequest;
import com.sales.shipping.dto.ShippingRequest;
import com.sales.shipping.model.enums.Carrier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class ViettelPostClient implements CarrierClient {

    private final String endpoint;
    private final String token;

    public ViettelPostClient(@Value("${carrier.viettelpost.endpoint}") String endpoint,
                             @Value("${carrier.viettelpost.token}") String token) {
        this.endpoint = endpoint;
        this.token = token;
    }

    @Override
    public Carrier getCarrier() {
        return Carrier.VIETTEL_POST;
    }

    @Override
    public Map<String, Object> createShipment(ShippingRequest request) {
        log.info("Creating ViettelPost shipment to {}", endpoint);
        Map<String, Object> result = new HashMap<>();
        result.put("trackingCode", "VTP" + System.currentTimeMillis());
        result.put("fee", "20000");
        result.put("status", "PENDING");
        return result;
    }

    @Override
    public Map<String, Object> trackShipment(String trackingCode) {
        log.info("Tracking ViettelPost shipment: {}", trackingCode);
        Map<String, Object> result = new HashMap<>();
        result.put("status", "IN_TRANSIT");
        result.put("currentLocation", "ViettelPost Processing");
        return result;
    }

    @Override
    public BigDecimal calculateFee(ShippingFeeRequest request) {
        return new BigDecimal("20000");
    }
}
