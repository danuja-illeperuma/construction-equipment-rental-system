package com.constructionrental.system.audit.repository;

import com.constructionrental.system.audit.dto.response.AuditLogResponse;
import com.constructionrental.system.audit.mapper.AuditLogRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class AuditRepository {

    private final JdbcTemplate jdbcTemplate;
    private final AuditLogRowMapper auditLogRowMapper;

    public AuditRepository(JdbcTemplate jdbcTemplate, AuditLogRowMapper auditLogRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.auditLogRowMapper = auditLogRowMapper;
    }

    public List<AuditLogResponse> findAll(String tableName, String action, Long userId, LocalDate startDate, LocalDate endDate, Integer limit) {
        StringBuilder sql = new StringBuilder("""
            SELECT a.audit_id, a.user_id, u.full_name, a.action, a.table_name,
                   a.record_id, a.description, a.created_at
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.user_id
            WHERE 1=1
            """);

        List<Object> params = new ArrayList<>();
        if (tableName != null && !tableName.isBlank()) {
            sql.append(" AND a.table_name = ?");
            params.add(tableName.trim());
        }
        if (action != null && !action.isBlank()) {
            sql.append(" AND a.action = ?");
            params.add(action.trim());
        }
        if (userId != null) {
            sql.append(" AND a.user_id = ?");
            params.add(userId);
        }
        if (startDate != null) {
            sql.append(" AND a.created_at >= ?");
            params.add(Date.valueOf(startDate));
        }
        if (endDate != null) {
            sql.append(" AND a.created_at < DATE_ADD(?, INTERVAL 1 DAY)");
            params.add(Date.valueOf(endDate));
        }
        int maxLimit = (limit != null && limit > 0 && limit <= 500) ? limit : 200;
        sql.append(" ORDER BY a.audit_id DESC LIMIT ").append(maxLimit);

        return jdbcTemplate.query(sql.toString(), auditLogRowMapper, params.toArray());
    }

    public Optional<AuditLogResponse> findById(Long id) {
        String sql = """
            SELECT a.audit_id, a.user_id, u.full_name, a.action, a.table_name,
                   a.record_id, a.description, a.created_at
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.user_id
            WHERE a.audit_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, auditLogRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void logAction(Long userId, String action, String tableName, Long recordId, String description) {
        String sql = """
            INSERT INTO audit_logs (user_id, action, table_name, record_id, description, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
            """;
        jdbcTemplate.update(sql, userId != null ? userId : 1L, action, tableName, recordId, description);
    }
}
