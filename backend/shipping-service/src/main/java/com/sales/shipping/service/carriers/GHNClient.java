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
public class GHNClient implements CarrierClient {

    private final String endpoint;
    private final String token;

    public GHNClient(@Value("${carrier.ghn.endpoint}") String endpoint,
                     @Value("${carrier.ghn.token}") String token) {
        this.endpoint = endpoint;
        this.token = token;
    }

    @Override
    public Carrier getCarrier() {
        return Carrier.GHN;
    }

    @Override
    public Map<String, Object> createShipment(ShippingRequest request) {
        log.info("Creating GHN shipment to {}", endpoint);
        Map<String, Object> result = new HashMap<>();
        result.put("trackingCode", "GHN" + System.currentTimeMillis());
        result.put("fee", "30000");
        result.put("status", "PENDING");
        return result;
    }

    @Override
    public Map<String, Object> trackShipment(String trackingCode) {
        log.info("Tracking GHN shipment: {}", trackingCode);
        Map<String, Object> result = new HashMap<>();
        result.put("status", "IN_TRANSIT");
        result.put("currentLocation", "GHN Hub");
        return result;
    }

    @Override
    public BigDecimal calculateFee(ShippingFeeRequest request) {
        return new BigDecimal("30000");
    }
}
