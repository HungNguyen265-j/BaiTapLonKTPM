package com.sales.customer.service.impl;

import com.sales.customer.dto.CustomerInteractionRequest;
import com.sales.customer.model.CustomerInteraction;
import com.sales.customer.repository.CustomerInteractionRepository;
import com.sales.customer.service.CustomerInteractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerInteractionServiceImpl implements CustomerInteractionService {

    private final CustomerInteractionRepository interactionRepository;

    @Override
    public CustomerInteraction addInteraction(UUID customerId, CustomerInteractionRequest request, String handledBy) {
        CustomerInteraction interaction = CustomerInteraction.builder()
                .customerId(customerId)
                .type(request.getType())
                .content(request.getContent())
                .channel(request.getChannel())
                .handledBy(handledBy)
                .build();
        interaction = interactionRepository.save(interaction);
        log.info("Interaction added for customer {}: {}", customerId, interaction.getId());
        return interaction;
    }

    @Override
    public List<CustomerInteraction> getInteractions(UUID customerId) {
        return interactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }
}
