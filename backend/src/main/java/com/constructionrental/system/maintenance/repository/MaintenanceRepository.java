package com.constructionrental.system.maintenance.repository;

import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.maintenance.dto.request.MaintenanceRequest;
import com.constructionrental.system.maintenance.dto.response.EquipmentMaintenanceSummaryResponse;
import com.constructionrental.system.maintenance.dto.response.MaintenanceResponse;
import com.constructionrental.system.maintenance.mapper.MaintenanceRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.Types;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class MaintenanceRepository {

    private final JdbcTemplate jdbcTemplate;
    private final MaintenanceRowMapper maintenanceRowMapper;

    public MaintenanceRepository(JdbcTemplate jdbcTemplate, MaintenanceRowMapper maintenanceRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.maintenanceRowMapper = maintenanceRowMapper;
    }

    public List<MaintenanceResponse> findAll(String status, Long equipmentId) {
        StringBuilder sql = new StringBuilder("""
            SELECT m.maintenance_id, m.equipment_id, e.equipment_code, e.equipment_name, e.status AS equipment_status,
                   m.maintenance_type, m.description, m.maintenance_cost, m.maintenance_date,
                   m.next_maintenance_date, m.status, m.notes, m.recorded_by,
                   u.full_name AS recorded_by_name, m.created_at,
                   m.customer_id, c.name AS customer_name, c.phone AS customer_phone,
                   m.is_paid, m.paid_at
            FROM maintenance_records m
            JOIN equipment e ON m.equipment_id = e.equipment_id
            JOIN users u ON m.recorded_by = u.user_id
            LEFT JOIN customers c ON m.customer_id = c.customer_id
            WHERE 1=1
            """);

        List<Object> params = new ArrayList<>();
        if (status != null && !status.isBlank()) {
            sql.append(" AND m.status = ?");
            params.add(status.trim());
        }
        if (equipmentId != null) {
            sql.append(" AND m.equipment_id = ?");
            params.add(equipmentId);
        }
        sql.append(" ORDER BY m.maintenance_date DESC, m.maintenance_id DESC");

        return jdbcTemplate.query(sql.toString(), maintenanceRowMapper, params.toArray());
    }

    public List<MaintenanceResponse> findByEquipmentId(Long equipmentId) {
        return findAll(null, equipmentId);
    }

    public Optional<MaintenanceResponse> findById(Long id) {
        String sql = """
            SELECT m.maintenance_id, m.equipment_id, e.equipment_code, e.equipment_name, e.status AS equipment_status,
                   m.maintenance_type, m.description, m.maintenance_cost, m.maintenance_date,
                   m.next_maintenance_date, m.status, m.notes, m.recorded_by,
                   u.full_name AS recorded_by_name, m.created_at,
                   m.customer_id, c.name AS customer_name, c.phone AS customer_phone,
                   m.is_paid, m.paid_at
            FROM maintenance_records m
            JOIN equipment e ON m.equipment_id = e.equipment_id
            JOIN users u ON m.recorded_by = u.user_id
            LEFT JOIN customers c ON m.customer_id = c.customer_id
            WHERE m.maintenance_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, maintenanceRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Long save(MaintenanceRequest request, Long recordedBy) {
        String sql = """
            INSERT INTO maintenance_records (equipment_id, maintenance_type, description, maintenance_cost,
                                             maintenance_date, next_maintenance_date, status, notes, recorded_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, NOW())
            """;
        org.springframework.jdbc.support.KeyHolder kh = new org.springframework.jdbc.support.GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            java.sql.PreparedStatement ps = connection.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, request.getEquipmentId());
            ps.setString(2, request.getMaintenanceType());
            ps.setString(3, request.getDescription());
            ps.setBigDecimal(4, request.getMaintenanceCost());
            ps.setDate(5, Date.valueOf(request.getMaintenanceDate()));
            ps.setDate(6, request.getNextMaintenanceDate() != null ? Date.valueOf(request.getNextMaintenanceDate()) : null);
            ps.setString(7, request.getNotes());
            ps.setLong(8, recordedBy != null ? recordedBy : 1L);
            return ps;
        }, kh);
        // Only transition equipment to MAINTENANCE immediately if maintenance date is today or in the past (e.g. urgent repair).
        // For future scheduled dates (> today), equipment stays AVAILABLE.
        // On the scheduled service date at 02:00 AM, MySQL scheduled event `evt_daily_maintenance_status_check`
        // automatically transitions the equipment status to MAINTENANCE.
        if (!request.getMaintenanceDate().isAfter(LocalDate.now())) {
            jdbcTemplate.update("UPDATE equipment SET status = 'MAINTENANCE' WHERE equipment_id = ?", request.getEquipmentId());
        }
        Long maintenanceId = kh.getKey() != null ? kh.getKey().longValue() : null;

        // Apply customer attribution and payment status
        if (maintenanceId != null) {
            boolean isPaid = false;
            if (request.getCustomerId() == null) {
                // If not billed to a customer, it is internal fleet maintenance handled by the company
                isPaid = true;
            } else if (request.getIsPaid() != null) {
                isPaid = request.getIsPaid();
            }
            jdbcTemplate.update(
                "UPDATE maintenance_records SET customer_id = ?, is_paid = ?, paid_at = ? WHERE maintenance_id = ?",
                request.getCustomerId(),
                isPaid,
                isPaid ? new java.sql.Timestamp(System.currentTimeMillis()) : null,
                maintenanceId
            );
        }
        return maintenanceId;
    }

    public void startProgress(Long id, String notes) {
        String sql = """
            UPDATE maintenance_records
            SET notes = ?,
                customer_id = NULL,
                is_paid = 1,
                paid_at = COALESCE(paid_at, NOW())
            WHERE maintenance_id = ?
            """;
        jdbcTemplate.update(sql, notes, id);
    }

    public int update(Long id, MaintenanceRequest request) {
        String sql = """
            UPDATE maintenance_records
            SET maintenance_type = ?, description = ?, maintenance_cost = ?,
                maintenance_date = ?, next_maintenance_date = ?, status = ?, notes = ?,
                customer_id = ?, is_paid = ?
            WHERE maintenance_id = ?
            """;
        boolean isPaid = request.getCustomerId() == null || Boolean.TRUE.equals(request.getIsPaid());
        return jdbcTemplate.update(sql,
                request.getMaintenanceType(),
                request.getDescription(),
                request.getMaintenanceCost(),
                Date.valueOf(request.getMaintenanceDate()),
                request.getNextMaintenanceDate() != null ? Date.valueOf(request.getNextMaintenanceDate()) : null,
                request.getStatus(),
                request.getNotes(),
                request.getCustomerId(),
                isPaid,
                id);
    }

    public int markAsPaid(Long id) {
        return markAsPaid(id, null);
    }

    public int markAsPaid(Long id, Long customerId) {
        if (customerId != null) {
            String sql = "UPDATE maintenance_records SET customer_id = ?, is_paid = TRUE, paid_at = NOW() WHERE maintenance_id = ?";
            return jdbcTemplate.update(sql, customerId, id);
        } else {
            String sql = "UPDATE maintenance_records SET is_paid = TRUE, paid_at = NOW() WHERE maintenance_id = ?";
            return jdbcTemplate.update(sql, id);
        }
    }

    public int markAsUnpaid(Long id, Long customerId) {
        if (customerId != null) {
            String sql = "UPDATE maintenance_records SET customer_id = ?, is_paid = FALSE, paid_at = NULL WHERE maintenance_id = ?";
            return jdbcTemplate.update(sql, customerId, id);
        } else {
            String sql = "UPDATE maintenance_records SET is_paid = FALSE, paid_at = NULL WHERE maintenance_id = ?";
            return jdbcTemplate.update(sql, id);
        }
    }

    public List<MaintenanceResponse> findByCustomerId(Long customerId) {
        String sql = """
            SELECT m.maintenance_id, m.equipment_id, e.equipment_code, e.equipment_name, e.status AS equipment_status,
                   m.maintenance_type, m.description, m.maintenance_cost, m.maintenance_date,
                   m.next_maintenance_date, m.status, m.notes, m.recorded_by,
                   u.full_name AS recorded_by_name, m.created_at,
                   m.customer_id, c.name AS customer_name, c.phone AS customer_phone,
                   m.is_paid, m.paid_at
            FROM maintenance_records m
            JOIN equipment e ON m.equipment_id = e.equipment_id
            JOIN users u ON m.recorded_by = u.user_id
            LEFT JOIN customers c ON m.customer_id = c.customer_id
            WHERE m.customer_id = ?
            ORDER BY m.maintenance_date DESC, m.maintenance_id DESC
            """;
        return jdbcTemplate.query(sql, maintenanceRowMapper, customerId);
    }

    public boolean hasUnpaidMaintenance(Long customerId) {
        String sql = "SELECT COUNT(*) FROM maintenance_records WHERE customer_id = ? AND is_paid = FALSE AND maintenance_cost > 0";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, customerId);
        return count != null && count > 0;
    }

    public BigDecimal getUnpaidMaintenanceTotal(Long customerId) {
        String sql = "SELECT COALESCE(SUM(maintenance_cost), 0.00) FROM maintenance_records WHERE customer_id = ? AND is_paid = FALSE";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, customerId);
    }

    public BigDecimal getTotalMaintenanceCharges(Long customerId) {
        String sql = "SELECT COALESCE(SUM(maintenance_cost), 0.00) FROM maintenance_records WHERE customer_id = ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, customerId);
    }

    public BigDecimal getPaidMaintenanceTotal(Long customerId) {
        String sql = "SELECT COALESCE(SUM(maintenance_cost), 0.00) FROM maintenance_records WHERE customer_id = ? AND is_paid = TRUE";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, customerId);
    }

    /**
     * Completes maintenance using MySQL Stored Procedure `sp_complete_maintenance`.
     */
    public void completeMaintenance(Long id, String notes, BigDecimal actualCost) {
        if (notes != null && !notes.isBlank()) {
            jdbcTemplate.update("UPDATE maintenance_records SET notes = ? WHERE maintenance_id = ?", notes.trim(), id);
        }
        jdbcTemplate.execute((Connection conn) -> {
            try (CallableStatement cs = conn.prepareCall("{CALL sp_complete_maintenance(?, ?, ?)}")) {
                cs.setLong(1, id);
                cs.setBigDecimal(2, actualCost != null ? actualCost : BigDecimal.ZERO);
                cs.registerOutParameter(3, Types.BOOLEAN);
                cs.execute();

                boolean success = cs.getBoolean(3);
                if (!success) {
                    throw new BadRequestException("Failed to complete maintenance");
                }
                return null;
            } catch (java.sql.SQLException e) {
                if (e.getErrorCode() == 1644 || "45000".equals(e.getSQLState())) {
                    throw new BadRequestException(e.getMessage());
                }
                // Fallback direct update
                jdbcTemplate.update("UPDATE maintenance_records SET status = 'COMPLETED', maintenance_cost = ? WHERE maintenance_id = ?", actualCost, id);
                jdbcTemplate.update("UPDATE equipment e JOIN maintenance_records m ON e.equipment_id = m.equipment_id SET e.status = 'AVAILABLE' WHERE m.maintenance_id = ?", id);
                return null;
            }
        });
    }

    /**
     * Workshop dashboard view using MySQL View `v_equipment_maintenance_summary`.
     */
    public List<EquipmentMaintenanceSummaryResponse> findEquipmentMaintenanceSummary() {
        String sql = """
            SELECT equipment_id, equipment_code, equipment_name, category_name,
                   equipment_status, total_jobs, total_maintenance_cost, last_service_date
            FROM v_equipment_maintenance_summary
            ORDER BY equipment_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Date dt = rs.getDate("last_service_date");
            return new EquipmentMaintenanceSummaryResponse(
                    rs.getLong("equipment_id"),
                    rs.getString("equipment_code"),
                    rs.getString("equipment_name"),
                    rs.getString("category_name"),
                    rs.getString("equipment_status"),
                    rs.getLong("total_jobs"),
                    rs.getBigDecimal("total_maintenance_cost"),
                    dt != null ? dt.toLocalDate() : null
            );
        });
    }

    /**
     * Executes MySQL User-Defined Function `calculate_equipment_maintenance_cost`.
     */
    public BigDecimal calculateEquipmentMaintenanceCost(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        String sql = "SELECT calculate_equipment_maintenance_cost(?, ?, ?)";
        try {
            return jdbcTemplate.queryForObject(sql, BigDecimal.class,
                    equipmentId,
                    startDate != null ? Date.valueOf(startDate) : null,
                    endDate != null ? Date.valueOf(endDate) : null);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
