package com.reportservice.service;

import com.reportservice.dto.DashboardResponse;
import com.reportservice.dto.RevenueReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    DashboardResponse getDashboardData(LocalDate startDate, LocalDate endDate);

    List<RevenueReportResponse> getRevenueReport(LocalDate startDate, LocalDate endDate, String channel);

    List<RevenueReportResponse> getTopProductsReport(LocalDate startDate, LocalDate endDate);
}
