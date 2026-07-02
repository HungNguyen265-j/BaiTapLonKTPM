package com.crm.customer.dto;

import com.crm.customer.model.Customer;
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
