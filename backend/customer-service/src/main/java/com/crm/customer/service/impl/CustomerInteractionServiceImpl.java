package com.crm.customer.service.impl;

import com.crm.customer.dto.CustomerInteractionRequest;
import com.crm.customer.exception.CustomerNotFoundException;
import com.crm.customer.model.CustomerInteraction;
import com.crm.customer.repository.CustomerInteractionRepository;
import com.crm.customer.repository.CustomerRepository;
import com.crm.customer.service.CustomerInteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerInteractionServiceImpl implements CustomerInteractionService {

    private final CustomerInteractionRepository interactionRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CustomerInteraction addInteraction(UUID customerId, CustomerInteractionRequest request, String handledBy) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException(customerId);
        }

        CustomerInteraction interaction = CustomerInteraction.builder()
                .customerId(customerId)
                .type(request.getType())
                .content(request.getContent())
                .channel(request.getChannel())
                .handledBy(handledBy)
                .build();

        return interactionRepository.save(interaction);
    }

    @Override
    public List<CustomerInteraction> getInteractions(UUID customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException(customerId);
        }
        return interactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }
}
