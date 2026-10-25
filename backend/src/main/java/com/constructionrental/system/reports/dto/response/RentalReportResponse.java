package com.constructionrental.system.reports.dto.response;

public class RentalReportResponse {
    private long totalRentals;
    private long activeRentals;
    private long completedRentals;
    private long pendingRentals;
    private long cancelledRentals;

    public RentalReportResponse() {}

    public RentalReportResponse(long totalRentals, long activeRentals, long completedRentals,
                                long pendingRentals, long cancelledRentals) {
        this.totalRentals = totalRentals;
        this.activeRentals = activeRentals;
        this.completedRentals = completedRentals;
        this.pendingRentals = pendingRentals;
        this.cancelledRentals = cancelledRentals;
    }

    public long getTotalRentals() {
        return totalRentals;
    }

    public void setTotalRentals(long totalRentals) {
        this.totalRentals = totalRentals;
    }

    public long getActiveRentals() {
        return activeRentals;
    }

    public void setActiveRentals(long activeRentals) {
        this.activeRentals = activeRentals;
    }

    public long getCompletedRentals() {
        return completedRentals;
    }

    public void setCompletedRentals(long completedRentals) {
        this.completedRentals = completedRentals;
    }

    public long getPendingRentals() {
        return pendingRentals;
    }

    public void setPendingRentals(long pendingRentals) {
        this.pendingRentals = pendingRentals;
    }

    public long getCancelledRentals() {
        return cancelledRentals;
    }

    public void setCancelledRentals(long cancelledRentals) {
        this.cancelledRentals = cancelledRentals;
    }
}
