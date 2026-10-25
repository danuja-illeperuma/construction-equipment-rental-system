package com.constructionrental.system.rental.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class QuotationRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Rental type is required")
    private String rentalType; // HOURLY, DAILY, MONTHLY

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Integer quantity;
    private BigDecimal duration;

    public QuotationRequest() {}

    public QuotationRequest(Long equipmentId, String rentalType, LocalDate startDate, LocalDate endDate, Integer quantity, BigDecimal duration) {
        this.equipmentId = equipmentId;
        this.rentalType = rentalType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.quantity = quantity;
        this.duration = duration;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getDuration() {
        return duration;
    }

    public void setDuration(BigDecimal duration) {
        this.duration = duration;
    }
}
