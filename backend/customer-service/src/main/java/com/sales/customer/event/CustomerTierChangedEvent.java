package com.sales.customer.event;

import com.sales.customer.model.Customer;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CustomerTierChangedEvent extends CustomerEvent {

    private Customer.Tier oldTier;
    private Customer.Tier newTier;
    private Double totalSpent;

    public CustomerTierChangedEvent(UUID customerId, String eventType, Customer.Tier oldTier,
                                     Customer.Tier newTier, Double totalSpent) {
        super(customerId, eventType);
        this.oldTier = oldTier;
        this.newTier = newTier;
        this.totalSpent = totalSpent;
    }
}
