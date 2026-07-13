package com.reportservice.repository;

import com.reportservice.model.RevenueReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RevenueReportRepository extends JpaRepository<RevenueReport, UUID> {

    List<RevenueReport> findByReportDateBetween(LocalDate startDate, LocalDate endDate);

    List<RevenueReport> findByChannelAndReportDateBetween(
            RevenueReport.Channel channel, LocalDate startDate, LocalDate endDate);
}
