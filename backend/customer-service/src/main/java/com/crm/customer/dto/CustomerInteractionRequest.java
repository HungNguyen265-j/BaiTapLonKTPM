package com.crm.customer.dto;

import com.crm.customer.model.CustomerInteraction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerInteractionRequest {

    @NotNull(message = "Interaction type is required")
    private CustomerInteraction.Type type;

    @NotBlank(message = "Content is required")
    private String content;

    private String channel;
}
