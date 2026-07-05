package com.sales.shipping.dto;

import com.sales.shipping.model.enums.Carrier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingFeeResponse {

    private List<FeeDetail> fees;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FeeDetail {
        private Carrier carrier;
        private BigDecimal fee;
        private String estimatedDelivery;
        private String note;
    }
}
