package com.sales.shipping.service.carriers;

import com.sales.shipping.dto.ShippingFeeRequest;
import com.sales.shipping.dto.ShippingRequest;
import com.sales.shipping.model.enums.Carrier;

import java.math.BigDecimal;
import java.util.Map;

public interface CarrierClient {

    Carrier getCarrier();

    Map<String, Object> createShipment(ShippingRequest request);

    Map<String, Object> trackShipment(String trackingCode);

    BigDecimal calculateFee(ShippingFeeRequest request);
}
