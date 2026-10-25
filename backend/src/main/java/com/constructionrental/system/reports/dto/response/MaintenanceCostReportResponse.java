package com.constructionrental.system.reports.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class MaintenanceCostReportResponse {
    private Long totalRecords;
    private BigDecimal totalExpense;
    private Long pendingRecords;
    private Long completedRecords;
    private List<Map<String, Object>> categoryBreakdown;

    public MaintenanceCostReportResponse() {}

    public MaintenanceCostReportResponse(Long totalRecords, BigDecimal totalExpense,
                                         Long pendingRecords, Long completedRecords,
                                         List<Map<String, Object>> categoryBreakdown) {
        this.totalRecords = totalRecords;
        this.totalExpense = totalExpense;
        this.pendingRecords = pendingRecords;
        this.completedRecords = completedRecords;
        this.categoryBreakdown = categoryBreakdown;
    }

    public Long getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(Long totalRecords) {
        this.totalRecords = totalRecords;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public Long getPendingRecords() {
        return pendingRecords;
    }

    public void setPendingRecords(Long pendingRecords) {
        this.pendingRecords = pendingRecords;
    }

    public Long getCompletedRecords() {
        return completedRecords;
    }

    public void setCompletedRecords(Long completedRecords) {
        this.completedRecords = completedRecords;
    }

    public List<Map<String, Object>> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<Map<String, Object>> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }
}
