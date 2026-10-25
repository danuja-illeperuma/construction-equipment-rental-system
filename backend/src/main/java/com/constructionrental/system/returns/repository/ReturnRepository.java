package com.constructionrental.system.returns.repository;

import com.constructionrental.system.returns.dto.response.EquipmentReturnResponse;
import com.constructionrental.system.returns.mapper.ReturnRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class ReturnRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ReturnRowMapper returnRowMapper;

    public ReturnRepository(JdbcTemplate jdbcTemplate, ReturnRowMapper returnRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.returnRowMapper = returnRowMapper;
    }

    /**
     * Executes the MySQL database function calculate_late_charge(p_rental_item_id, p_returned_at).
     */
    public BigDecimal callCalculateLateCharge(Long rentalItemId, LocalDateTime returnedAt) {
        String sql = "SELECT calculate_late_charge(?, ?)";
        try {
            return jdbcTemplate.queryForObject(sql, BigDecimal.class, rentalItemId, Timestamp.valueOf(returnedAt));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    /**
     * Executes the MySQL stored procedure sp_process_return.
     * Computes late charge, inserts equipment_returns, updates equipment status,
     * and sets rental status to COMPLETED if all items have been returned.
     */
    public Long callProcessReturn(Long rentalItemId, LocalDateTime returnedAt, String condition, String notes, Long recordedBy) {
        return jdbcTemplate.execute((Connection conn) -> {
            try (CallableStatement cs = conn.prepareCall("{CALL sp_process_return(?, ?, ?, ?, ?, ?, ?)}")) {
                cs.setLong(1, rentalItemId);
                cs.setTimestamp(2, Timestamp.valueOf(returnedAt));
                cs.setString(3, condition);
                cs.setString(4, notes);
                cs.setLong(5, recordedBy);
                cs.registerOutParameter(6, Types.BIGINT);
                cs.registerOutParameter(7, Types.DECIMAL);
                cs.execute();
                return cs.getLong(6);
            }
        });
    }

    public List<EquipmentReturnResponse> findAll() {
        String sql = """
            SELECT er.return_id, er.rental_item_id, ri.rental_id, e.equipment_code,
                   e.equipment_name, er.returned_at, er.condition, er.late_charge,
                   er.notes, er.recorded_by, u.full_name AS recorded_by_name, er.created_at
            FROM equipment_returns er
            JOIN rental_items ri ON er.rental_item_id = ri.rental_item_id
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            JOIN users u ON er.recorded_by = u.user_id
            ORDER BY er.return_id DESC
            """;
        return jdbcTemplate.query(sql, returnRowMapper);
    }

    public Optional<EquipmentReturnResponse> findById(Long returnId) {
        String sql = """
            SELECT er.return_id, er.rental_item_id, ri.rental_id, e.equipment_code,
                   e.equipment_name, er.returned_at, er.condition, er.late_charge,
                   er.notes, er.recorded_by, u.full_name AS recorded_by_name, er.created_at
            FROM equipment_returns er
            JOIN rental_items ri ON er.rental_item_id = ri.rental_item_id
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            JOIN users u ON er.recorded_by = u.user_id
            WHERE er.return_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, returnRowMapper, returnId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<EquipmentReturnResponse> findByRentalItemId(Long rentalItemId) {
        String sql = """
            SELECT er.return_id, er.rental_item_id, ri.rental_id, e.equipment_code,
                   e.equipment_name, er.returned_at, er.condition, er.late_charge,
                   er.notes, er.recorded_by, u.full_name AS recorded_by_name, er.created_at
            FROM equipment_returns er
            JOIN rental_items ri ON er.rental_item_id = ri.rental_item_id
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            JOIN users u ON er.recorded_by = u.user_id
            WHERE er.rental_item_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, returnRowMapper, rentalItemId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<EquipmentReturnResponse> findByRentalId(Long rentalId) {
        String sql = """
            SELECT er.return_id, er.rental_item_id, ri.rental_id, e.equipment_code,
                   e.equipment_name, er.returned_at, er.condition, er.late_charge,
                   er.notes, er.recorded_by, u.full_name AS recorded_by_name, er.created_at
            FROM equipment_returns er
            JOIN rental_items ri ON er.rental_item_id = ri.rental_item_id
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            JOIN users u ON er.recorded_by = u.user_id
            WHERE ri.rental_id = ?
            ORDER BY er.return_id DESC
            """;
        return jdbcTemplate.query(sql, returnRowMapper, rentalId);
    }

    public int countUnreturnedItems(Long rentalId) {
        String sql = """
            SELECT COUNT(*)
            FROM rental_items ri
            LEFT JOIN equipment_returns er ON ri.rental_item_id = er.rental_item_id
            WHERE ri.rental_id = ? AND er.return_id IS NULL
            """;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, rentalId);
        return count != null ? count : 0;
    }
}
