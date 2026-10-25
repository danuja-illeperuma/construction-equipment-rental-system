package com.constructionrental.system.maintenance.dto.request;

import java.math.BigDecimal;

public class MaintenanceCompleteRequest {
    private String notes;
    private BigDecimal actualCost;

    public MaintenanceCompleteRequest() {}

    public MaintenanceCompleteRequest(String notes, BigDecimal actualCost) {
        this.notes = notes;
        this.actualCost = actualCost;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getActualCost() {
        return actualCost;
    }

    public void setActualCost(BigDecimal actualCost) {
        this.actualCost = actualCost;
    }
}
