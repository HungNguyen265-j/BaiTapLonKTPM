package com.sales.promotion.repository;

import com.sales.promotion.model.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, UUID> {

    List<FlashSale> findByStatus(FlashSale.FlashSaleStatus status);

    List<FlashSale> findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            LocalDateTime startTime, LocalDateTime endTime);
}
