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
public class GHTKClient implements CarrierClient {

    private final String endpoint;
    private final String token;

    public GHTKClient(@Value("${carrier.ghtk.endpoint}") String endpoint,
                      @Value("${carrier.ghtk.token}") String token) {
        this.endpoint = endpoint;
        this.token = token;
    }

    @Override
    public Carrier getCarrier() {
        return Carrier.GHTK;
    }

    @Override
    public Map<String, Object> createShipment(ShippingRequest request) {
        log.info("Creating GHTK shipment to {}", endpoint);
        Map<String, Object> result = new HashMap<>();
        result.put("trackingCode", "GHTK" + System.currentTimeMillis());
        result.put("fee", "25000");
        result.put("status", "PENDING");
        return result;
    }

    @Override
    public Map<String, Object> trackShipment(String trackingCode) {
        log.info("Tracking GHTK shipment: {}", trackingCode);
        Map<String, Object> result = new HashMap<>();
        result.put("status", "IN_TRANSIT");
        result.put("currentLocation", "GHTK Sorting Center");
        return result;
    }

    @Override
    public BigDecimal calculateFee(ShippingFeeRequest request) {
        return new BigDecimal("25000");
    }
}
