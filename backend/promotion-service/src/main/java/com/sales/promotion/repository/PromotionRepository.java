package com.sales.promotion.repository;

import com.sales.promotion.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {

    Optional<Promotion> findByCode(String code);

    List<Promotion> findByStatus(Promotion.PromotionStatus status);

    List<Promotion> findByStartDateBeforeAndEndDateAfter(LocalDateTime startDate, LocalDateTime endDate);

    List<Promotion> findByApplicableChannelsContaining(String channel);

    List<Promotion> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Promotion.PromotionStatus status, LocalDateTime startDate, LocalDateTime endDate);
}
