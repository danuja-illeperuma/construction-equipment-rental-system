package com.constructionrental.system.equipment.dto.response;

import java.math.BigDecimal;

public class AvailableEquipmentResponse {

    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private String categoryName;
    private BigDecimal dailyRate;
    private BigDecimal hourlyRate;
    private BigDecimal monthlyRate;
    private String status;

    public AvailableEquipmentResponse() {}

    public AvailableEquipmentResponse(Long equipmentId, String equipmentCode, String equipmentName,
                                      String categoryName, BigDecimal dailyRate, BigDecimal hourlyRate,
                                      BigDecimal monthlyRate, String status) {
        this.equipmentId = equipmentId;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.categoryName = categoryName;
        this.dailyRate = dailyRate;
        this.hourlyRate = hourlyRate;
        this.monthlyRate = monthlyRate;
        this.status = status;
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

    public BigDecimal getDailyRate() {
        return dailyRate;
    }

    public void setDailyRate(BigDecimal dailyRate) {
        this.dailyRate = dailyRate;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getMonthlyRate() {
        return monthlyRate;
    }

    public void setMonthlyRate(BigDecimal monthlyRate) {
        this.monthlyRate = monthlyRate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
