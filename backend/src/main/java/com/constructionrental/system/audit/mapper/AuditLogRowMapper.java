package com.constructionrental.system.audit.mapper;

import com.constructionrental.system.audit.dto.response.AuditLogResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Component
public class AuditLogRowMapper implements RowMapper<AuditLogResponse> {

    @Override
    public AuditLogResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        Timestamp createdAt = rs.getTimestamp("created_at");
        String userName = null;

        try {
            userName = rs.getString("full_name");
        } catch (SQLException ignored) {}

        return new AuditLogResponse(
                rs.getLong("audit_id"),
                rs.getLong("user_id"),
                userName,
                rs.getString("action"),
                rs.getString("table_name"),
                rs.getObject("record_id") != null ? rs.getLong("record_id") : null,
                rs.getString("description"),
                createdAt != null ? createdAt.toLocalDateTime() : null
        );
    }
}
