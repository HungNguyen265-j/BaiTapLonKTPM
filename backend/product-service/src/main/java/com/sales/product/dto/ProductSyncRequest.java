package com.sales.product.dto;

import com.sales.product.model.SalesChannel;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSyncRequest {

    @NotNull(message = "At least one channel must be specified")
    @NotEmpty(message = "At least one channel must be specified")
    private List<SalesChannel> channels;
}
