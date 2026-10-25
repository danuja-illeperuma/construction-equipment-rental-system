package com.constructionrental.system.returns.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class DamageReportRequest {

    @NotNull(message = "Return ID is required")
    private Long returnId;

    @NotBlank(message = "Description is required")
    @Size(max = 500)
    private String description;

    @NotNull(message = "Damage charge is required")
    @DecimalMin(value = "0.0", message = "Damage charge must be non-negative")
    private BigDecimal damageCharge = BigDecimal.ZERO;

    public DamageReportRequest() {}

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
}
