package com.constructionrental.system.returns.repository;

import com.constructionrental.system.returns.dto.response.DamageReportResponse;
import com.constructionrental.system.returns.mapper.DamageReportRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

@Repository
public class DamageReportRepository {

    private final JdbcTemplate jdbcTemplate;
    private final DamageReportRowMapper damageReportRowMapper;

    public DamageReportRepository(JdbcTemplate jdbcTemplate, DamageReportRowMapper damageReportRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.damageReportRowMapper = damageReportRowMapper;
    }

    /**
     * Inserts damage report and ensures equipment status remains in MAINTENANCE.
     */
    public Long callRecordDamage(Long returnId, String description, BigDecimal damageCharge, Long reportedBy) {
        org.springframework.jdbc.support.KeyHolder keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            java.sql.PreparedStatement ps = connection.prepareStatement(
                "INSERT INTO damage_reports (return_id, description, damage_charge, reported_by, created_at) VALUES (?, ?, ?, ?, NOW())",
                java.sql.Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, returnId);
            ps.setString(2, description);
            ps.setBigDecimal(3, damageCharge != null ? damageCharge : BigDecimal.ZERO);
            ps.setLong(4, reportedBy);
            return ps;
        }, keyHolder);

        // Ensure equipment status is set to MAINTENANCE
        jdbcTemplate.update("""
            UPDATE equipment e
            JOIN rental_items ri ON e.equipment_id = ri.equipment_id
            JOIN equipment_returns er ON ri.rental_item_id = er.rental_item_id
            SET e.status = 'MAINTENANCE'
            WHERE er.return_id = ?
        """, returnId);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public List<DamageReportResponse> findAll() {
        String sql = """
            SELECT dr.damage_id, dr.return_id, dr.description, dr.damage_charge,
                   dr.reported_by, u.full_name AS reported_by_name, dr.created_at
            FROM damage_reports dr
            JOIN users u ON dr.reported_by = u.user_id
            ORDER BY dr.damage_id DESC
            """;
        return jdbcTemplate.query(sql, damageReportRowMapper);
    }

    public Optional<DamageReportResponse> findById(Long damageId) {
        String sql = """
            SELECT dr.damage_id, dr.return_id, dr.description, dr.damage_charge,
                   dr.reported_by, u.full_name AS reported_by_name, dr.created_at
            FROM damage_reports dr
            JOIN users u ON dr.reported_by = u.user_id
            WHERE dr.damage_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, damageReportRowMapper, damageId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<DamageReportResponse> findByReturnId(Long returnId) {
        String sql = """
            SELECT dr.damage_id, dr.return_id, dr.description, dr.damage_charge,
                   dr.reported_by, u.full_name AS reported_by_name, dr.created_at
            FROM damage_reports dr
            JOIN users u ON dr.reported_by = u.user_id
            WHERE dr.return_id = ?
            ORDER BY dr.damage_id DESC
            """;
        return jdbcTemplate.query(sql, damageReportRowMapper, returnId);
    }
}
