package com.constructionrental.system.reports.controller;

import com.constructionrental.system.common.dto.ApiResponse;
import com.constructionrental.system.reports.dto.response.*;
import com.constructionrental.system.reports.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/rentals")
    public ResponseEntity<ApiResponse<RentalReportResponse>> getRentalReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRentalReport()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueReport()));
    }

    @GetMapping("/equipment")
    public ResponseEntity<ApiResponse<EquipmentUtilizationResponse>> getEquipmentUtilization() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getEquipmentUtilizationReport()));
    }

    @GetMapping("/equipment-performance")
    public ResponseEntity<ApiResponse<List<EquipmentPerformanceResponse>>> getEquipmentPerformance(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getEquipmentPerformance(category, status)));
    }

    @GetMapping("/maintenance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMaintenanceReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMaintenanceReport()));
    }

    @GetMapping("/maintenance-cost")
    public ResponseEntity<ApiResponse<MaintenanceCostReportResponse>> getMaintenanceCostReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMaintenanceCostReport()));
    }

    @GetMapping({"/payment-summary", "/payments"})
    public ResponseEntity<ApiResponse<PaymentSummaryResponse>> getPaymentSummary() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getPaymentSummary()));
    }

    @GetMapping({"/damage-summary", "/damage"})
    public ResponseEntity<ApiResponse<DamageSummaryResponse>> getDamageSummary() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDamageSummary()));
    }
}
