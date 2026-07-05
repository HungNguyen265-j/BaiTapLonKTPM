package com.sales.report.service;

import com.sales.report.dto.DashboardResponse;
import com.sales.report.dto.RevenueReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    DashboardResponse getDashboardData(LocalDate startDate, LocalDate endDate);

    List<RevenueReportResponse> getRevenueReport(LocalDate startDate, LocalDate endDate, String channel);

    List<RevenueReportResponse> getTopProductsReport(LocalDate startDate, LocalDate endDate);
}
