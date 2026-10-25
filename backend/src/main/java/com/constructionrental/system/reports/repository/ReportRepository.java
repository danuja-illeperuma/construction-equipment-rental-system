package com.constructionrental.system.reports.repository;

import com.constructionrental.system.reports.dto.response.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class ReportRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReportRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public RentalReportResponse getRentalStats() {
        String sql = """
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_cnt,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_cnt,
                SUM(CASE WHEN status = 'PENDING_PAYMENT' THEN 1 ELSE 0 END) AS pending_cnt,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_cnt
            FROM rentals
            """;

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new RentalReportResponse(
                rs.getLong("total"),
                rs.getLong("active_cnt"),
                rs.getLong("completed_cnt"),
                rs.getLong("pending_cnt"),
                rs.getLong("cancelled_cnt")
        ));
    }

    public RevenueReportResponse getRevenueStats() {
        String rentalRevSql = "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'SUCCESS'";
        BigDecimal rentalRev = jdbcTemplate.queryForObject(rentalRevSql, BigDecimal.class);

        String lateChargeSql = "SELECT COALESCE(SUM(late_charge), 0) FROM equipment_returns";
        BigDecimal lateCharges = jdbcTemplate.queryForObject(lateChargeSql, BigDecimal.class);

        String damageChargeSql = "SELECT COALESCE(SUM(damage_charge), 0) FROM damage_reports";
        BigDecimal damageCharges = jdbcTemplate.queryForObject(damageChargeSql, BigDecimal.class);

        BigDecimal total = (rentalRev != null ? rentalRev : BigDecimal.ZERO)
                .add(lateCharges != null ? lateCharges : BigDecimal.ZERO)
                .add(damageCharges != null ? damageCharges : BigDecimal.ZERO);

        return new RevenueReportResponse(
                rentalRev != null ? rentalRev : BigDecimal.ZERO,
                lateCharges != null ? lateCharges : BigDecimal.ZERO,
                damageCharges != null ? damageCharges : BigDecimal.ZERO,
                total
        );
    }

    public EquipmentUtilizationResponse getEquipmentUtilization() {
        String sql = """
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS avail_cnt,
                SUM(CASE WHEN status = 'RENTED' THEN 1 ELSE 0 END) AS rented_cnt,
                SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maint_cnt
            FROM equipment
            WHERE is_active = 1
            """;

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            long total = rs.getLong("total");
            long avail = rs.getLong("avail_cnt");
            long rented = rs.getLong("rented_cnt");
            long maint = rs.getLong("maint_cnt");
            double utilRate = total > 0 ? ((double) rented / total) * 100.0 : 0.0;
            return new EquipmentUtilizationResponse(total, avail, rented, maint, Math.round(utilRate * 100.0) / 100.0);
        });
    }

    public Map<String, Object> getMaintenanceExpenseStats() {
        String sql = """
            SELECT
                COUNT(*) AS total_records,
                COALESCE(SUM(maintenance_cost), 0.00) AS total_expense,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_records,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_records
            FROM maintenance_records
            """;
        return jdbcTemplate.queryForMap(sql);
    }

    public List<EquipmentPerformanceResponse> getEquipmentPerformance(String category, String status) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                e.equipment_id,
                e.equipment_code,
                e.equipment_name,
                c.category_name,
                e.status AS equipment_status,
                COALESCE(rent_stats.rental_count, 0) AS rental_count,
                COALESCE(rent_stats.rental_revenue, 0.00) AS rental_revenue,
                COALESCE(maint_stats.maintenance_count, 0) AS maintenance_count,
                COALESCE(maint_stats.total_maintenance_cost, 0.00) AS total_maintenance_cost,
                (COALESCE(rent_stats.rental_revenue, 0.00) - COALESCE(maint_stats.total_maintenance_cost, 0.00)) AS net_profit,
                COALESCE(dmg_stats.damage_count, 0) AS damage_count,
                COALESCE(dmg_stats.total_damage_charge, 0.00) AS total_damage_charge
            FROM equipment e
            JOIN equipment_categories c ON e.category_id = c.category_id
            LEFT JOIN (
                SELECT 
                    ri.equipment_id,
                    COUNT(DISTINCT r.rental_id) AS rental_count,
                    SUM(ri.item_amount) AS rental_revenue
                FROM rental_items ri
                JOIN rentals r ON ri.rental_id = r.rental_id
                WHERE r.status IN ('CONFIRMED', 'ACTIVE', 'COMPLETED')
                GROUP BY ri.equipment_id
            ) rent_stats ON e.equipment_id = rent_stats.equipment_id
            LEFT JOIN (
                SELECT 
                    m.equipment_id,
                    COUNT(m.maintenance_id) AS maintenance_count,
                    SUM(m.maintenance_cost) AS total_maintenance_cost
                FROM maintenance_records m
                GROUP BY m.equipment_id
            ) maint_stats ON e.equipment_id = maint_stats.equipment_id
            LEFT JOIN (
                SELECT 
                    ri.equipment_id,
                    COUNT(dr.damage_id) AS damage_count,
                    SUM(dr.damage_charge) AS total_damage_charge
                FROM damage_reports dr
                JOIN equipment_returns er ON dr.return_id = er.return_id
                JOIN rental_items ri ON er.rental_item_id = ri.rental_item_id
                GROUP BY ri.equipment_id
            ) dmg_stats ON e.equipment_id = dmg_stats.equipment_id
            WHERE 1=1
            """);

        List<Object> params = new ArrayList<>();
        if (category != null && !category.isBlank()) {
            sql.append(" AND category_name = ?");
            params.add(category);
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND equipment_status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY net_profit DESC, equipment_id ASC");

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> new EquipmentPerformanceResponse(
                rs.getLong("equipment_id"),
                rs.getString("equipment_code"),
                rs.getString("equipment_name"),
                rs.getString("category_name"),
                rs.getString("equipment_status"),
                rs.getLong("rental_count"),
                rs.getBigDecimal("rental_revenue"),
                rs.getLong("maintenance_count"),
                rs.getBigDecimal("total_maintenance_cost"),
                rs.getBigDecimal("net_profit"),
                rs.getLong("damage_count"),
                rs.getBigDecimal("total_damage_charge")
        ), params.toArray());
    }

    public MaintenanceCostReportResponse getMaintenanceCostReport() {
        String statsSql = """
            SELECT
                COUNT(*) AS total_records,
                COALESCE(SUM(maintenance_cost), 0.00) AS total_expense,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_records,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_records
            FROM maintenance_records
            """;
        Map<String, Object> stats = jdbcTemplate.queryForMap(statsSql);
        Long totalRecords = ((Number) stats.get("total_records")).longValue();
        BigDecimal totalExpense = stats.get("total_expense") != null ? (BigDecimal) stats.get("total_expense") : BigDecimal.ZERO;
        Long pendingRecords = stats.get("pending_records") != null ? ((Number) stats.get("pending_records")).longValue() : 0L;
        Long completedRecords = stats.get("completed_records") != null ? ((Number) stats.get("completed_records")).longValue() : 0L;

        String breakdownSql = """
            SELECT 
                YEAR(m.maintenance_date) AS maintenance_year,
                MONTH(m.maintenance_date) AS maintenance_month,
                c.category_name,
                COUNT(m.maintenance_id) AS total_jobs,
                COALESCE(SUM(CASE WHEN m.maintenance_type = 'ROUTINE' THEN m.maintenance_cost ELSE 0 END), 0.00) AS routine_cost,
                COALESCE(SUM(CASE WHEN m.maintenance_type = 'REPAIR' THEN m.maintenance_cost ELSE 0 END), 0.00) AS repair_cost,
                COALESCE(SUM(m.maintenance_cost), 0.00) AS total_cost
            FROM maintenance_records m
            JOIN equipment e ON m.equipment_id = e.equipment_id
            JOIN equipment_categories c ON e.category_id = c.category_id
            GROUP BY YEAR(m.maintenance_date), MONTH(m.maintenance_date), c.category_name
            ORDER BY maintenance_year DESC, maintenance_month DESC, category_name ASC
            """;
        List<Map<String, Object>> breakdown = jdbcTemplate.queryForList(breakdownSql);

        return new MaintenanceCostReportResponse(totalRecords, totalExpense, pendingRecords, completedRecords, breakdown);
    }

    public PaymentSummaryResponse getPaymentSummary() {
        String totalSql = """
            SELECT 
                COUNT(*) AS total_payments,
                COALESCE(SUM(CASE WHEN payment_status = 'SUCCESS' THEN amount ELSE 0 END), 0.00) AS total_collected
            FROM payments
            """;
        Map<String, Object> totalMap = jdbcTemplate.queryForMap(totalSql);
        Long totalPayments = ((Number) totalMap.get("total_payments")).longValue();
        BigDecimal totalCollected = totalMap.get("total_collected") != null ? (BigDecimal) totalMap.get("total_collected") : BigDecimal.ZERO;

        String statusSql = """
            SELECT 
                payment_status AS status,
                COUNT(*) AS count,
                COALESCE(SUM(amount), 0.00) AS total_amount
            FROM payments
            GROUP BY payment_status
            """;
        List<Map<String, Object>> byStatus = jdbcTemplate.queryForList(statusSql);

        String methodSql = """
            SELECT 
                payment_method AS method,
                COUNT(*) AS count,
                COALESCE(SUM(amount), 0.00) AS total_amount
            FROM payments
            WHERE payment_status = 'SUCCESS'
            GROUP BY payment_method
            """;
        List<Map<String, Object>> byMethod = jdbcTemplate.queryForList(methodSql);

        return new PaymentSummaryResponse(totalPayments, totalCollected, byStatus, byMethod);
    }

    public DamageSummaryResponse getDamageSummary() {
        String totalSql = """
            SELECT 
                COUNT(*) AS total_reports,
                COALESCE(SUM(damage_charge), 0.00) AS total_charges
            FROM damage_reports
            """;
        Map<String, Object> totalMap = jdbcTemplate.queryForMap(totalSql);
        Long totalReports = ((Number) totalMap.get("total_reports")).longValue();
        BigDecimal totalCharges = totalMap.get("total_charges") != null ? (BigDecimal) totalMap.get("total_charges") : BigDecimal.ZERO;

        String conditionSql = """
            SELECT 
                er.condition AS return_condition,
                COUNT(dr.damage_id) AS count,
                COALESCE(SUM(dr.damage_charge), 0.00) AS total_charges
            FROM damage_reports dr
            JOIN equipment_returns er ON dr.return_id = er.return_id
            GROUP BY er.condition
            """;
        List<Map<String, Object>> byCondition = jdbcTemplate.queryForList(conditionSql);

        String topEqSql = """
            SELECT 
                e.equipment_id,
                e.equipment_name,
                COUNT(dr.damage_id) AS damage_count,
                COALESCE(SUM(dr.damage_charge), 0.00) AS total_charges
            FROM damage_reports dr
            JOIN equipment_returns er ON dr.return_id = er.return_id
            JOIN rental_items ri ON er.rental_item_id = ri.rental_item_id
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            GROUP BY e.equipment_id, e.equipment_name
            ORDER BY damage_count DESC, total_charges DESC
            LIMIT 10
            """;
        List<Map<String, Object>> topDamaged = jdbcTemplate.queryForList(topEqSql);

        return new DamageSummaryResponse(totalReports, totalCharges, byCondition, topDamaged);
    }

    /**
     * Executes MySQL scalar function calculate_equipment_maintenance_cost.
     */
    public BigDecimal calculateEquipmentMaintenanceCost(Long equipmentId, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        String sql = "SELECT calculate_equipment_maintenance_cost(?, ?, ?)";
        try {
            return jdbcTemplate.queryForObject(sql, BigDecimal.class,
                    equipmentId,
                    startDate != null ? java.sql.Date.valueOf(startDate) : null,
                    endDate != null ? java.sql.Date.valueOf(endDate) : null);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
