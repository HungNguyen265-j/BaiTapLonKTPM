package com.sales.shipping.dto;

import com.sales.shipping.model.enums.Carrier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingFeeRequest {

    @NotBlank
    private String fromCity;

    @NotBlank
    private String toCity;

    @NotNull
    private BigDecimal weight;

    @NotNull
    private Carrier carrier;
}
