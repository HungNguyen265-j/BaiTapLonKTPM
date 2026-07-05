package com.sales.customer.repository;

import com.sales.customer.model.CustomerInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerInteractionRepository extends JpaRepository<CustomerInteraction, UUID> {

    List<CustomerInteraction> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
}
