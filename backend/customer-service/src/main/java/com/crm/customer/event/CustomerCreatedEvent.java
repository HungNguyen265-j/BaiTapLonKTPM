package com.crm.customer.event;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class CustomerCreatedEvent extends CustomerEvent {

    public CustomerCreatedEvent(UUID customerId, String eventType) {
        super(customerId, eventType);
    }
}
