package com.constructionrental.system.rental.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public class RentalItemRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Rental type is required")
    @Pattern(regexp = "HOURLY|DAILY|MONTHLY", message = "Rental type must be HOURLY, DAILY, or MONTHLY")
    private String rentalType;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;

    @NotNull(message = "Duration is required")
    @DecimalMin(value = "0.01", message = "Duration must be greater than zero")
    private BigDecimal duration = BigDecimal.ONE;

    public RentalItemRequest() {}

    public RentalItemRequest(Long equipmentId, String rentalType, Integer quantity, BigDecimal duration) {
        this.equipmentId = equipmentId;
        this.rentalType = rentalType;
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
