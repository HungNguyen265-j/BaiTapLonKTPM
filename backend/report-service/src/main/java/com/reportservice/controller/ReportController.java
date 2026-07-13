package com.reportservice.controller;

import com.reportservice.dto.DashboardResponse;
import com.reportservice.dto.RevenueReportResponse;
import com.reportservice.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        DashboardResponse dashboard = reportService.getDashboardData(startDate, endDate);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueReportResponse>> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String channel) {
        List<RevenueReportResponse> reports = reportService.getRevenueReport(startDate, endDate, channel);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<RevenueReportResponse>> getTopProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<RevenueReportResponse> reports = reportService.getTopProductsReport(startDate, endDate);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/daily-summary")
    public ResponseEntity<String> getDailySummary() {
        return ResponseEntity.ok("Daily summary endpoint");
    }
}
