package com.sales.product.dto;

import com.sales.product.model.SalesChannel;
import com.sales.product.model.SyncStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductChannelResponse {

    private UUID id;
    private UUID productId;
    private SalesChannel channel;
    private String channelProductId;
    private String channelUrl;
    private SyncStatus syncStatus;
    private String status;
    private LocalDateTime lastSyncAt;
    private String channelData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
