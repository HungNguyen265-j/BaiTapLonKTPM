package com.crm.customer.service.impl;

import com.crm.customer.model.Customer;
import com.crm.customer.service.TierService;
import org.springframework.stereotype.Service;

@Service
public class TierServiceImpl implements TierService {

    private static final double BRONZE_THRESHOLD = 0;
    private static final double SILVER_THRESHOLD = 1_000_000;
    private static final double GOLD_THRESHOLD = 5_000_000;
    private static final double PLATINUM_THRESHOLD = 20_000_000;

    @Override
    public Customer.Tier calculateTier(Double totalSpent) {
        if (totalSpent >= PLATINUM_THRESHOLD) {
            return Customer.Tier.PLATINUM;
        } else if (totalSpent >= GOLD_THRESHOLD) {
            return Customer.Tier.GOLD;
        } else if (totalSpent >= SILVER_THRESHOLD) {
            return Customer.Tier.SILVER;
        }
        return Customer.Tier.BRONZE;
    }

    @Override
    public Customer.Tier upgradeTier(Customer.Tier currentTier, Double totalSpent) {
        Customer.Tier calculatedTier = calculateTier(totalSpent);
        if (calculatedTier.ordinal() > currentTier.ordinal()) {
            return calculatedTier;
        }
        return currentTier;
    }

    @Override
    public Customer.Tier downgradeTier(Customer.Tier currentTier, Double totalSpent) {
        Customer.Tier calculatedTier = calculateTier(totalSpent);
        if (calculatedTier.ordinal() < currentTier.ordinal()) {
            return calculatedTier;
        }
        return currentTier;
    }

    @Override
    public Double getMinimumSpendingForNextTier(Customer.Tier currentTier) {
        return switch (currentTier) {
            case BRONZE -> SILVER_THRESHOLD;
            case SILVER -> GOLD_THRESHOLD;
            case GOLD -> PLATINUM_THRESHOLD;
            case PLATINUM -> -1.0;
        };
    }
}
