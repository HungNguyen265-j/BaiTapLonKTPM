package com.btlktpm.shipping.dto;

import com.btlktpm.shipping.model.enums.Carrier;
import com.btlktpm.shipping.model.enums.CarrierStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarrierConfigRequest {

    @NotNull
    private Carrier carrier;

    private String apiKey;

    private String apiSecret;

    @NotBlank
    private String endpointUrl;

    private String callbackUrl;

    @NotNull
    private CarrierStatus status;

    private String configData;
}
