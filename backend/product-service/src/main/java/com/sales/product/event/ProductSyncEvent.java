package com.sales.product.event;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSyncEvent extends ProductEvent {

    private String channel;
}
