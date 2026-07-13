package com.btlktpm.shipping.dto;

import com.btlktpm.shipping.model.enums.Carrier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingRequest {

    @NotNull
    private UUID orderId;

    @NotBlank
    private String orderCode;

    @NotNull
    private Carrier carrier;

    @NotBlank
    private String receiverName;

    @NotBlank
    private String receiverPhone;

    @NotBlank
    private String receiverAddress;

    @NotBlank
    private String toCity;

    @NotBlank
    private String toDistrict;

    @NotNull
    private BigDecimal weight;

    @NotNull
    private BigDecimal cod;

    private String note;
}
