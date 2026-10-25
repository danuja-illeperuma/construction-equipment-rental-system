package com.constructionrental.system.reports.service;

import com.constructionrental.system.reports.dto.response.*;
import com.constructionrental.system.reports.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public RentalReportResponse getRentalReport() {
        return reportRepository.getRentalStats();
    }

    public RevenueReportResponse getRevenueReport() {
        return reportRepository.getRevenueStats();
    }

    public EquipmentUtilizationResponse getEquipmentUtilizationReport() {
        return reportRepository.getEquipmentUtilization();
    }

    public Map<String, Object> getMaintenanceReport() {
        return reportRepository.getMaintenanceExpenseStats();
    }

    public List<EquipmentPerformanceResponse> getEquipmentPerformance(String category, String status) {
        return reportRepository.getEquipmentPerformance(category, status);
    }

    public MaintenanceCostReportResponse getMaintenanceCostReport() {
        return reportRepository.getMaintenanceCostReport();
    }

    public PaymentSummaryResponse getPaymentSummary() {
        return reportRepository.getPaymentSummary();
    }

    public DamageSummaryResponse getDamageSummary() {
        return reportRepository.getDamageSummary();
    }
}
