package com.constructionrental.system.equipment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EquipmentResponse {

    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private Long categoryId;
    private String categoryName;
    private String brand;
    private String model;
    private BigDecimal hourlyRate;
    private BigDecimal dailyRate;
    private BigDecimal monthlyRate;
    private String status;
    private String location;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String primaryImageUrl;
    private List<EquipmentImageDto> images = new ArrayList<>();

    public EquipmentResponse() {}

    public EquipmentResponse(Long equipmentId, String equipmentCode, String equipmentName, Long categoryId,
                             String categoryName, String brand, String model, BigDecimal hourlyRate,
                             BigDecimal dailyRate, BigDecimal monthlyRate, String status, String location,
                             Boolean isActive, LocalDateTime createdAt) {
        this(equipmentId, equipmentCode, equipmentName, categoryId, categoryName, brand, model,
                hourlyRate, dailyRate, monthlyRate, status, location, isActive, createdAt, null);
    }

    public EquipmentResponse(Long equipmentId, String equipmentCode, String equipmentName, Long categoryId,
                             String categoryName, String brand, String model, BigDecimal hourlyRate,
                             BigDecimal dailyRate, BigDecimal monthlyRate, String status, String location,
                             Boolean isActive, LocalDateTime createdAt, String primaryImageUrl) {
        this.equipmentId = equipmentId;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.brand = brand;
        this.model = model;
        this.hourlyRate = hourlyRate;
        this.dailyRate = dailyRate;
        this.monthlyRate = monthlyRate;
        this.status = status;
        this.location = location;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.primaryImageUrl = primaryImageUrl;
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getDailyRate() {
        return dailyRate;
    }

    public void setDailyRate(BigDecimal dailyRate) {
        this.dailyRate = dailyRate;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public void setPrimaryImageUrl(String primaryImageUrl) {
        this.primaryImageUrl = primaryImageUrl;
    }

    public List<EquipmentImageDto> getImages() {
        return images;
    }

    public void setImages(List<EquipmentImageDto> images) {
        this.images = images != null ? images : new ArrayList<>();
    }
}
