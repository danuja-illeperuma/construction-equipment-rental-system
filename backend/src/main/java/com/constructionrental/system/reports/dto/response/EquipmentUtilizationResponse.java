package com.constructionrental.system.reports.dto.response;

public class EquipmentUtilizationResponse {
    private long totalFleet;
    private long availableCount;
    private long rentedCount;
    private long maintenanceCount;
    private double utilizationRatePercentage;

    public EquipmentUtilizationResponse() {}

    public EquipmentUtilizationResponse(long totalFleet, long availableCount, long rentedCount,
                                        long maintenanceCount, double utilizationRatePercentage) {
        this.totalFleet = totalFleet;
        this.availableCount = availableCount;
        this.rentedCount = rentedCount;
        this.maintenanceCount = maintenanceCount;
        this.utilizationRatePercentage = utilizationRatePercentage;
    }

    public long getTotalFleet() {
        return totalFleet;
    }

    public void setTotalFleet(long totalFleet) {
        this.totalFleet = totalFleet;
    }

    public long getAvailableCount() {
        return availableCount;
    }

    public void setAvailableCount(long availableCount) {
        this.availableCount = availableCount;
    }

    public long getRentedCount() {
        return rentedCount;
    }

    public void setRentedCount(long rentedCount) {
        this.rentedCount = rentedCount;
    }

    public long getMaintenanceCount() {
        return maintenanceCount;
    }

    public void setMaintenanceCount(long maintenanceCount) {
        this.maintenanceCount = maintenanceCount;
    }

    public double getUtilizationRatePercentage() {
        return utilizationRatePercentage;
    }

    public void setUtilizationRatePercentage(double utilizationRatePercentage) {
        this.utilizationRatePercentage = utilizationRatePercentage;
    }
}
