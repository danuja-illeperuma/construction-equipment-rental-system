package com.constructionrental.system.maintenance.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class CustomerMaintenanceSummaryResponse {
    private Long customerId;
    private BigDecimal totalCharges;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private boolean hasOutstandingDues;
    private List<MaintenanceResponse> records;

    public CustomerMaintenanceSummaryResponse() {}

    public CustomerMaintenanceSummaryResponse(Long customerId, BigDecimal totalCharges, BigDecimal paidAmount,
                                             BigDecimal outstandingAmount, boolean hasOutstandingDues,
                                             List<MaintenanceResponse> records) {
        this.customerId = customerId;
        this.totalCharges = totalCharges;
        this.paidAmount = paidAmount;
        this.outstandingAmount = outstandingAmount;
        this.hasOutstandingDues = hasOutstandingDues;
        this.records = records;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public BigDecimal getTotalCharges() {
        return totalCharges;
    }

    public void setTotalCharges(BigDecimal totalCharges) {
        this.totalCharges = totalCharges;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(BigDecimal outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }

    public boolean isHasOutstandingDues() {
        return hasOutstandingDues;
    }

    public void setHasOutstandingDues(boolean hasOutstandingDues) {
        this.hasOutstandingDues = hasOutstandingDues;
    }

    public List<MaintenanceResponse> getRecords() {
        return records;
    }

    public void setRecords(List<MaintenanceResponse> records) {
        this.records = records;
    }
}
