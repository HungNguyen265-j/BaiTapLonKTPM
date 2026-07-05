package com.sales.customer.repository;

import com.sales.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID>, JpaSpecificationExecutor<Customer> {

    Optional<Customer> findByCode(String code);

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhone(String phone);

    List<Customer> findByNameContainingIgnoreCase(String name);

    List<Customer> findByTier(Customer.Tier tier);

    List<Customer> findByStatus(Customer.Status status);

    List<Customer> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
