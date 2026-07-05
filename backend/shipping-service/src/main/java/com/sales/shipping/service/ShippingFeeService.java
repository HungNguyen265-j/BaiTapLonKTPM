package com.sales.shipping.service;

import com.sales.shipping.dto.ShippingFeeRequest;
import com.sales.shipping.dto.ShippingFeeResponse;
import com.sales.shipping.exception.CarrierException;
import com.sales.shipping.model.enums.Carrier;
import com.sales.shipping.service.carriers.CarrierClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingFeeService {

    private final List<CarrierClient> carrierClients;

    public ShippingFeeResponse calculateFee(ShippingFeeRequest request) {
        List<ShippingFeeResponse.FeeDetail> fees = new ArrayList<>();

        CarrierClient client = resolveClient(request.getCarrier());
        try {
            BigDecimal fee = client.calculateFee(request);
            fees.add(ShippingFeeResponse.FeeDetail.builder()
                    .carrier(client.getCarrier())
                    .fee(fee)
                    .estimatedDelivery("2-4 days")
                    .note("Estimated fee from " + client.getCarrier())
                    .build());
        } catch (Exception e) {
            log.error("Failed to calculate fee for carrier {}", request.getCarrier(), e);
            fees.add(ShippingFeeResponse.FeeDetail.builder()
                    .carrier(request.getCarrier())
                    .fee(BigDecimal.ZERO)
                    .estimatedDelivery("N/A")
                    .note("Unable to calculate: " + e.getMessage())
                    .build());
        }

        return ShippingFeeResponse.builder().fees(fees).build();
    }

    public ShippingFeeResponse calculateAllFees(ShippingFeeRequest baseRequest) {
        List<ShippingFeeResponse.FeeDetail> fees = new ArrayList<>();

        for (CarrierClient client : carrierClients) {
            try {
                ShippingFeeRequest req = ShippingFeeRequest.builder()
                        .fromCity(baseRequest.getFromCity())
                        .toCity(baseRequest.getToCity())
                        .weight(baseRequest.getWeight())
                        .carrier(client.getCarrier())
                        .build();
                BigDecimal fee = client.calculateFee(req);
                fees.add(ShippingFeeResponse.FeeDetail.builder()
                        .carrier(client.getCarrier())
                        .fee(fee)
                        .estimatedDelivery("2-4 days")
                        .note("Estimated fee from " + client.getCarrier())
                        .build());
            } catch (Exception e) {
                log.error("Failed to calculate fee for carrier {}", client.getCarrier(), e);
            }
        }

        return ShippingFeeResponse.builder().fees(fees).build();
    }

    private CarrierClient resolveClient(Carrier carrier) {
        return carrierClients.stream()
                .filter(c -> c.getCarrier() == carrier)
                .findFirst()
                .orElseThrow(() -> new CarrierException("No client for carrier: " + carrier));
    }
}
