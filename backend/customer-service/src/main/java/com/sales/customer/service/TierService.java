package com.sales.customer.service;

import com.sales.customer.model.Customer;

public interface TierService {

    Customer.Tier calculateTier(Double totalSpent);

    Customer.Tier upgradeTier(Customer.Tier currentTier, Double totalSpent);

    Customer.Tier downgradeTier(Customer.Tier currentTier, Double totalSpent);

    Double getMinimumSpendingForNextTier(Customer.Tier currentTier);
}
