package com.sales.customer.service;

import com.sales.customer.dto.CustomerInteractionRequest;
import com.sales.customer.model.CustomerInteraction;

import java.util.List;
import java.util.UUID;

public interface CustomerInteractionService {

    CustomerInteraction addInteraction(UUID customerId, CustomerInteractionRequest request, String handledBy);

    List<CustomerInteraction> getInteractions(UUID customerId);
}
