package com.sales.report.controller;

import com.sales.report.dto.DashboardResponse;
import com.sales.report.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardResponse> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        DashboardResponse summary = dashboardService.getSummary(startDate, endDate);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/revenue-by-channel")
    public ResponseEntity<Map<String, BigDecimal>> getRevenueByChannel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, BigDecimal> revenueByChannel = dashboardService.getRevenueByChannel(startDate, endDate);
        return ResponseEntity.ok(revenueByChannel);
    }

    @GetMapping("/revenue-by-day")
    public ResponseEntity<Map<String, BigDecimal>> getRevenueByDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, BigDecimal> revenueByDay = dashboardService.getRevenueByDay(startDate, endDate);
        return ResponseEntity.ok(revenueByDay);
    }
}
