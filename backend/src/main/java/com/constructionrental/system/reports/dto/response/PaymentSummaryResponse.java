package com.constructionrental.system.reports.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class PaymentSummaryResponse {
    private Long totalPayments;
    private BigDecimal totalAmountCollected;
    private List<Map<String, Object>> byStatus;
    private List<Map<String, Object>> byMethod;

    public PaymentSummaryResponse() {}

    public PaymentSummaryResponse(Long totalPayments, BigDecimal totalAmountCollected,
                                  List<Map<String, Object>> byStatus, List<Map<String, Object>> byMethod) {
        this.totalPayments = totalPayments;
        this.totalAmountCollected = totalAmountCollected;
        this.byStatus = byStatus;
        this.byMethod = byMethod;
    }

    public Long getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(Long totalPayments) {
        this.totalPayments = totalPayments;
    }

    public BigDecimal getTotalAmountCollected() {
        return totalAmountCollected;
    }

    public void setTotalAmountCollected(BigDecimal totalAmountCollected) {
        this.totalAmountCollected = totalAmountCollected;
    }

    public List<Map<String, Object>> getByStatus() {
        return byStatus;
    }

    public void setByStatus(List<Map<String, Object>> byStatus) {
        this.byStatus = byStatus;
    }

    public List<Map<String, Object>> getByMethod() {
        return byMethod;
    }

    public void setByMethod(List<Map<String, Object>> byMethod) {
        this.byMethod = byMethod;
    }
}
