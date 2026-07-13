package com.crm.customer.service;

import com.crm.customer.dto.CustomerInteractionRequest;
import com.crm.customer.model.CustomerInteraction;

import java.util.List;
import java.util.UUID;

public interface CustomerInteractionService {

    CustomerInteraction addInteraction(UUID customerId, CustomerInteractionRequest request, String handledBy);

    List<CustomerInteraction> getInteractions(UUID customerId);
}
