package com.constructionrental.system.returns.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DamageReportResponse {
    private Long damageId;
    private Long returnId;
    private String description;
    private BigDecimal damageCharge;
    private Long reportedBy;
    private String reportedByName;
    private LocalDateTime createdAt;

    public DamageReportResponse() {}

    public DamageReportResponse(Long damageId, Long returnId, String description, BigDecimal damageCharge,
                                Long reportedBy, String reportedByName, LocalDateTime createdAt) {
        this.damageId = damageId;
        this.returnId = returnId;
        this.description = description;
        this.damageCharge = damageCharge;
        this.reportedBy = reportedBy;
        this.reportedByName = reportedByName;
        this.createdAt = createdAt;
    }

    public Long getDamageId() {
        return damageId;
    }

    public void setDamageId(Long damageId) {
        this.damageId = damageId;
    }

    public Long getReturnId() {
        return returnId;
    }

    public void setReturnId(Long returnId) {
        this.returnId = returnId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getDamageCharge() {
        return damageCharge;
    }

    public void setDamageCharge(BigDecimal damageCharge) {
        this.damageCharge = damageCharge;
    }

    public Long getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(Long reportedBy) {
        this.reportedBy = reportedBy;
    }

    public String getReportedByName() {
        return reportedByName;
    }

    public void setReportedByName(String reportedByName) {
        this.reportedByName = reportedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
