package com.constructionrental.system.equipment.dto;

import java.time.LocalDateTime;

public class EquipmentImageDto {

    private Long imageId;
    private Long equipmentId;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    public EquipmentImageDto() {}

    public EquipmentImageDto(Long imageId, Long equipmentId, String imageUrl, Boolean isPrimary,
                             Integer displayOrder, LocalDateTime createdAt) {
        this.imageId = imageId;
        this.equipmentId = equipmentId;
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
        this.displayOrder = displayOrder;
        this.createdAt = createdAt;
    }

    public Long getImageId() {
        return imageId;
    }

    public void setImageId(Long imageId) {
        this.imageId = imageId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean primary) {
        isPrimary = primary;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
