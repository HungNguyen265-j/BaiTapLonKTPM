package com.sales.customer.dto;

import com.sales.customer.model.Customer;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierUpgradeRequest {

    @NotNull(message = "Tier is required")
    private Customer.Tier tier;
}
