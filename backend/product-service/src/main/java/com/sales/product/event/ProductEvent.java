package com.sales.product.event;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductEvent implements Serializable {

    private String eventId = UUID.randomUUID().toString();
    private String productId;
    private String sku;
    private String eventType;
    private LocalDateTime timestamp = LocalDateTime.now();
}
