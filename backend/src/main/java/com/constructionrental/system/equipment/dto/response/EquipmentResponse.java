package com.constructionrental.system.equipment.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EquipmentResponse extends com.constructionrental.system.equipment.dto.EquipmentResponse {

    public EquipmentResponse() {
        super();
    }

    public EquipmentResponse(Long equipmentId, String equipmentCode, String equipmentName, Long categoryId,
                             String categoryName, String brand, String model, BigDecimal hourlyRate,
                             BigDecimal dailyRate, BigDecimal monthlyRate, String status, String location,
                             Boolean isActive, LocalDateTime createdAt) {
        super(equipmentId, equipmentCode, equipmentName, categoryId, categoryName, brand, model,
                hourlyRate, dailyRate, monthlyRate, status, location, isActive, createdAt);
    }

    public EquipmentResponse(Long equipmentId, String equipmentCode, String equipmentName, Long categoryId,
                             String categoryName, String brand, String model, BigDecimal hourlyRate,
                             BigDecimal dailyRate, BigDecimal monthlyRate, String status, String location,
                             Boolean isActive, LocalDateTime createdAt,
                             String primaryImageUrl) {
        super(equipmentId, equipmentCode, equipmentName, categoryId, categoryName, brand, model,
                hourlyRate, dailyRate, monthlyRate, status, location, isActive, createdAt, primaryImageUrl);
    }

    @Deprecated
    public EquipmentResponse(Long equipmentId, String equipmentCode, String equipmentName, Long categoryId,
                             String categoryName, String brand, String model, BigDecimal hourlyRate,
                             BigDecimal dailyRate, BigDecimal monthlyRate, String status, String location,
                             Boolean operatorAvailable, Boolean isActive, LocalDateTime createdAt) {
        super(equipmentId, equipmentCode, equipmentName, categoryId, categoryName, brand, model,
                hourlyRate, dailyRate, monthlyRate, status, location, isActive, createdAt);
    }

    @Deprecated
    public EquipmentResponse(Long equipmentId, String equipmentCode, String equipmentName, Long categoryId,
                             String categoryName, String brand, String model, BigDecimal hourlyRate,
                             BigDecimal dailyRate, BigDecimal monthlyRate, String status, String location,
                             Boolean operatorAvailable, Boolean isActive, LocalDateTime createdAt,
                             String primaryImageUrl) {
        super(equipmentId, equipmentCode, equipmentName, categoryId, categoryName, brand, model,
                hourlyRate, dailyRate, monthlyRate, status, location, isActive, createdAt, primaryImageUrl);
    }
}
