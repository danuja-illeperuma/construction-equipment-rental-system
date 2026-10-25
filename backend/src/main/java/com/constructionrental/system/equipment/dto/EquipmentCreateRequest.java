package com.constructionrental.system.equipment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EquipmentCreateRequest {

    @NotBlank(message = "Equipment code is required")
    @Size(max = 30, message = "Equipment code must not exceed 30 characters")
    private String equipmentCode;

    @NotBlank(message = "Equipment name is required")
    @Size(max = 150, message = "Equipment name must not exceed 150 characters")
    private String equipmentName;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;

    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    @DecimalMin(value = "0.0", message = "Hourly rate must be non-negative")
    private BigDecimal hourlyRate;

    @DecimalMin(value = "0.0", message = "Daily rate must be non-negative")
    private BigDecimal dailyRate;

    @DecimalMin(value = "0.0", message = "Monthly rate must be non-negative")
    private BigDecimal monthlyRate;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    private String primaryImageUrl;
    private List<String> imageUrls;

    public EquipmentCreateRequest() {}

    public EquipmentCreateRequest(String equipmentCode, String equipmentName, Long categoryId,
                                  String brand, String model, BigDecimal hourlyRate,
                                  BigDecimal dailyRate, BigDecimal monthlyRate,
                                  String location) {
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.categoryId = categoryId;
        this.brand = brand;
        this.model = model;
        this.hourlyRate = hourlyRate;
        this.dailyRate = dailyRate;
        this.monthlyRate = monthlyRate;
        this.location = location;
    }

    @Deprecated
    public EquipmentCreateRequest(String equipmentCode, String equipmentName, Long categoryId,
                                  String brand, String model, BigDecimal hourlyRate,
                                  BigDecimal dailyRate, BigDecimal monthlyRate,
                                  String location, Boolean operatorAvailable) {
        this(equipmentCode, equipmentName, categoryId, brand, model, hourlyRate, dailyRate, monthlyRate, location);
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public void setPrimaryImageUrl(String primaryImageUrl) {
        this.primaryImageUrl = primaryImageUrl;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
