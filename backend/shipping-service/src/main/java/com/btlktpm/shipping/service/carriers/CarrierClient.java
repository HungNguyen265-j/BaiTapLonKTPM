package com.btlktpm.shipping.service.carriers;

import com.btlktpm.shipping.dto.ShippingRequest;
import com.btlktpm.shipping.dto.ShippingFeeRequest;
import com.btlktpm.shipping.model.Shipment;
import com.btlktpm.shipping.model.enums.Carrier;

import java.math.BigDecimal;
import java.util.Map;

public interface CarrierClient {

    Carrier getCarrier();

    Map<String, Object> createShipment(ShippingRequest request);

    Map<String, Object> trackShipment(String trackingCode);

    BigDecimal calculateFee(ShippingFeeRequest request);

    Map<String, Object> cancelShipment(String trackingCode);
}
