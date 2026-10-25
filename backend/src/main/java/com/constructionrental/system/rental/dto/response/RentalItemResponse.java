package com.constructionrental.system.rental.dto.response;

import java.math.BigDecimal;

public class RentalItemResponse {
    private Long rentalItemId;
    private Long rentalId;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private String rentalType;
    private Integer quantity;
    private BigDecimal duration;
    private BigDecimal unitRate;
    private BigDecimal itemAmount;
    private Boolean isReturned;

    public RentalItemResponse() {}

    public RentalItemResponse(Long rentalItemId, Long rentalId, Long equipmentId, String equipmentCode,
                              String equipmentName, String rentalType, Integer quantity, BigDecimal duration,
                              BigDecimal unitRate, BigDecimal itemAmount, Boolean isReturned) {
        this.rentalItemId = rentalItemId;
        this.rentalId = rentalId;
        this.equipmentId = equipmentId;
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.rentalType = rentalType;
        this.quantity = quantity;
        this.duration = duration;
        this.unitRate = unitRate;
        this.itemAmount = itemAmount;
        this.isReturned = isReturned;
    }

    public Long getRentalItemId() {
        return rentalItemId;
    }

    public void setRentalItemId(Long rentalItemId) {
        this.rentalItemId = rentalItemId;
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
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

    public BigDecimal getUnitRate() {
        return unitRate;
    }

    public void setUnitRate(BigDecimal unitRate) {
        this.unitRate = unitRate;
    }

    public BigDecimal getItemAmount() {
        return itemAmount;
    }

    public void setItemAmount(BigDecimal itemAmount) {
        this.itemAmount = itemAmount;
    }

    public Boolean getIsReturned() {
        return isReturned;
    }

    public void setIsReturned(Boolean returned) {
        isReturned = returned;
    }
}
