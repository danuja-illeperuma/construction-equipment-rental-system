package com.constructionrental.system.reports.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DamageSummaryResponse {
    private Long totalDamageReports;
    private BigDecimal totalDamageCharges;
    private List<Map<String, Object>> byCondition;
    private List<Map<String, Object>> topDamagedEquipment;

    public DamageSummaryResponse() {}

    public DamageSummaryResponse(Long totalDamageReports, BigDecimal totalDamageCharges,
                                 List<Map<String, Object>> byCondition, List<Map<String, Object>> topDamagedEquipment) {
        this.totalDamageReports = totalDamageReports;
        this.totalDamageCharges = totalDamageCharges;
        this.byCondition = byCondition;
        this.topDamagedEquipment = topDamagedEquipment;
    }

    public Long getTotalDamageReports() {
        return totalDamageReports;
    }

    public void setTotalDamageReports(Long totalDamageReports) {
        this.totalDamageReports = totalDamageReports;
    }

    public BigDecimal getTotalDamageCharges() {
        return totalDamageCharges;
    }

    public void setTotalDamageCharges(BigDecimal totalDamageCharges) {
        this.totalDamageCharges = totalDamageCharges;
    }

    public List<Map<String, Object>> getByCondition() {
        return byCondition;
    }

    public void setByCondition(List<Map<String, Object>> byCondition) {
        this.byCondition = byCondition;
    }

    public List<Map<String, Object>> getTopDamagedEquipment() {
        return topDamagedEquipment;
    }

    public void setTopDamagedEquipment(List<Map<String, Object>> topDamagedEquipment) {
        this.topDamagedEquipment = topDamagedEquipment;
    }
}
