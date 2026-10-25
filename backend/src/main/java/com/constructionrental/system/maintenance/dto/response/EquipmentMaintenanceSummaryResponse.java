package com.constructionrental.system.maintenance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EquipmentMaintenanceSummaryResponse {

    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private String categoryName;
    private String equipmentStatus;
    private Long totalJobs;
    private BigDecimal totalMaintenanceCost;
    private LocalDate lastServiceDate;

    public EquipmentMaintenanceSummaryResponse() {}

    public EquipmentMaintenanceSummaryResponse(Long equipmentId, String equipmentCode, String equipmentName,
                                              String categoryName, String equipmentStatus, Long totalJobs,
                                              BigDecimal totalMaintenanceCost, LocalDate lastServiceDate) {
        this.equipmentId = equipmentId;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.categoryName = categoryName;
        this.equipmentStatus = equipmentStatus;
        this.totalJobs = totalJobs;
        this.totalMaintenanceCost = totalMaintenanceCost;
        this.lastServiceDate = lastServiceDate;
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

    public Long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(Long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public BigDecimal getTotalMaintenanceCost() {
        return totalMaintenanceCost;
    }

    public void setTotalMaintenanceCost(BigDecimal totalMaintenanceCost) {
        this.totalMaintenanceCost = totalMaintenanceCost;
    }

    public LocalDate getLastServiceDate() {
        return lastServiceDate;
    }

    public void setLastServiceDate(LocalDate lastServiceDate) {
        this.lastServiceDate = lastServiceDate;
    }
}
