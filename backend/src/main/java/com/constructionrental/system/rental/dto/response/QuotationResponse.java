package com.constructionrental.system.rental.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;

public class QuotationResponse {

    private String quotationReference;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String brand;
    private String model;
    private String categoryName;
    private String location;
    private String rentalType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal duration;
    private String durationLabel;
    private Integer quantity;
    private BigDecimal unitRate;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private boolean isAvailable;
    private String availabilityMessage;

    public QuotationResponse() {}

    public QuotationResponse(String quotationReference, Long equipmentId, String equipmentName, String equipmentCode,
                             String brand, String model, String categoryName, String location,
                             String rentalType, LocalDate startDate, LocalDate endDate, BigDecimal duration,
                             String durationLabel, Integer quantity, BigDecimal unitRate, BigDecimal subtotal,
                             BigDecimal totalAmount, boolean isAvailable, String availabilityMessage) {
        this.quotationReference = quotationReference;
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.equipmentCode = equipmentCode;
        this.brand = brand;
        this.model = model;
        this.categoryName = categoryName;
        this.location = location;
        this.rentalType = rentalType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.duration = duration;
        this.durationLabel = durationLabel;
        this.quantity = quantity;
        this.unitRate = unitRate;
        this.subtotal = subtotal;
        this.totalAmount = totalAmount;
        this.isAvailable = isAvailable;
        this.availabilityMessage = availabilityMessage;
    }

    @Deprecated
    public QuotationResponse(String quotationReference, Long equipmentId, String equipmentName, String equipmentCode,
                             String brand, String model, String categoryName, String location, Boolean operatorAvailable,
                             String rentalType, LocalDate startDate, LocalDate endDate, BigDecimal duration,
                             String durationLabel, Integer quantity, BigDecimal unitRate, BigDecimal subtotal,
                             BigDecimal totalAmount, boolean isAvailable, String availabilityMessage) {
        this(quotationReference, equipmentId, equipmentName, equipmentCode, brand, model, categoryName, location,
                rentalType, startDate, endDate, duration, durationLabel, quantity, unitRate, subtotal, totalAmount,
                isAvailable, availabilityMessage);
    }

    public String getQuotationReference() {
        return quotationReference;
    }

    public void setQuotationReference(String quotationReference) {
        this.quotationReference = quotationReference;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    public String getRentalType() {
        return rentalType;
    }

    public void setRentalType(String rentalType) {
        this.rentalType = rentalType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getDuration() {
        return duration;
    }

    public void setDuration(BigDecimal duration) {
        this.duration = duration;
    }

    public String getDurationLabel() {
        return durationLabel;
    }

    public void setDurationLabel(String durationLabel) {
        this.durationLabel = durationLabel;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitRate() {
        return unitRate;
    }

    public void setUnitRate(BigDecimal unitRate) {
        this.unitRate = unitRate;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    @JsonProperty("isAvailable")
    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public String getAvailabilityMessage() {
        return availabilityMessage;
    }

    public void setAvailabilityMessage(String availabilityMessage) {
        this.availabilityMessage = availabilityMessage;
    }
}
