package com.constructionrental.system.reports.dto.response;

import java.math.BigDecimal;

public class RevenueReportResponse {
    private BigDecimal totalRentalRevenue;
    private BigDecimal totalLateCharges;
    private BigDecimal totalDamageCharges;
    private BigDecimal netRevenue;

    public RevenueReportResponse() {}

    public RevenueReportResponse(BigDecimal totalRentalRevenue, BigDecimal totalLateCharges,
                                 BigDecimal totalDamageCharges, BigDecimal netRevenue) {
        this.totalRentalRevenue = totalRentalRevenue;
        this.totalLateCharges = totalLateCharges;
        this.totalDamageCharges = totalDamageCharges;
        this.netRevenue = netRevenue;
    }

    public BigDecimal getTotalRentalRevenue() {
        return totalRentalRevenue;
    }

    public void setTotalRentalRevenue(BigDecimal totalRentalRevenue) {
        this.totalRentalRevenue = totalRentalRevenue;
    }

    public BigDecimal getTotalLateCharges() {
        return totalLateCharges;
    }

    public void setTotalLateCharges(BigDecimal totalLateCharges) {
        this.totalLateCharges = totalLateCharges;
    }

    public BigDecimal getTotalDamageCharges() {
        return totalDamageCharges;
    }

    public void setTotalDamageCharges(BigDecimal totalDamageCharges) {
        this.totalDamageCharges = totalDamageCharges;
    }

    public BigDecimal getNetRevenue() {
        return netRevenue;
    }

    public void setNetRevenue(BigDecimal netRevenue) {
        this.netRevenue = netRevenue;
    }
}
