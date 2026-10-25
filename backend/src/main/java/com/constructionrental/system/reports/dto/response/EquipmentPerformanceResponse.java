package com.constructionrental.system.reports.dto.response;

import java.math.BigDecimal;

public class EquipmentPerformanceResponse {
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private String categoryName;
    private String equipmentStatus;
    private Long rentalCount;
    private BigDecimal rentalRevenue;
    private Long maintenanceCount;
    private BigDecimal totalMaintenanceCost;
    private BigDecimal netProfit;
    private Long damageCount;
    private BigDecimal totalDamageCharge;

    public EquipmentPerformanceResponse() {}

    public EquipmentPerformanceResponse(Long equipmentId, String equipmentCode, String equipmentName,
                                        String categoryName, String equipmentStatus, Long rentalCount,
                                        BigDecimal rentalRevenue, Long maintenanceCount,
                                        BigDecimal totalMaintenanceCost, BigDecimal netProfit,
                                        Long damageCount, BigDecimal totalDamageCharge) {
        this.equipmentId = equipmentId;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.categoryName = categoryName;
        this.equipmentStatus = equipmentStatus;
        this.rentalCount = rentalCount;
        this.rentalRevenue = rentalRevenue;
        this.maintenanceCount = maintenanceCount;
        this.totalMaintenanceCost = totalMaintenanceCost;
        this.netProfit = netProfit;
        this.damageCount = damageCount;
        this.totalDamageCharge = totalDamageCharge;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getEquipmentStatus() {
        return equipmentStatus;
    }

    public void setEquipmentStatus(String equipmentStatus) {
        this.equipmentStatus = equipmentStatus;
    }

    public Long getRentalCount() {
        return rentalCount;
    }

    public void setRentalCount(Long rentalCount) {
        this.rentalCount = rentalCount;
    }

    public BigDecimal getRentalRevenue() {
        return rentalRevenue;
    }

    public void setRentalRevenue(BigDecimal rentalRevenue) {
        this.rentalRevenue = rentalRevenue;
    }

    public Long getMaintenanceCount() {
        return maintenanceCount;
    }

    public void setMaintenanceCount(Long maintenanceCount) {
        this.maintenanceCount = maintenanceCount;
    }

    public BigDecimal getTotalMaintenanceCost() {
        return totalMaintenanceCost;
    }

    public void setTotalMaintenanceCost(BigDecimal totalMaintenanceCost) {
        this.totalMaintenanceCost = totalMaintenanceCost;
    }

    public BigDecimal getNetProfit() {
        return netProfit;
    }

    public void setNetProfit(BigDecimal netProfit) {
        this.netProfit = netProfit;
    }

    public Long getDamageCount() {
        return damageCount;
    }

    public void setDamageCount(Long damageCount) {
        this.damageCount = damageCount;
    }

    public BigDecimal getTotalDamageCharge() {
        return totalDamageCharge;
    }

    public void setTotalDamageCharge(BigDecimal totalDamageCharge) {
        this.totalDamageCharge = totalDamageCharge;
    }
}
