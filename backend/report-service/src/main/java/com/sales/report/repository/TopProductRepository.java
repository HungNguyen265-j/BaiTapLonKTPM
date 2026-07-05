package com.sales.report.repository;

import com.sales.report.model.TopProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TopProductRepository extends JpaRepository<TopProduct, UUID> {

    List<TopProduct> findByReportDateBetweenOrderByQuantitySoldDesc(LocalDate startDate, LocalDate endDate);
}
