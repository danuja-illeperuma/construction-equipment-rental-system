package com.constructionrental.system.returns.mapper;

import com.constructionrental.system.returns.dto.response.DamageReportResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Component
public class DamageReportRowMapper implements RowMapper<DamageReportResponse> {

    @Override
    public DamageReportResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        Timestamp createdAt = rs.getTimestamp("created_at");
        String reportedByName = null;

        try {
            reportedByName = rs.getString("reported_by_name");
        } catch (SQLException ignored) {}

        return new DamageReportResponse(
                rs.getLong("damage_id"),
                rs.getLong("return_id"),
                rs.getString("description"),
                rs.getBigDecimal("damage_charge"),
                rs.getLong("reported_by"),
                reportedByName,
                createdAt != null ? createdAt.toLocalDateTime() : null
        );
    }
}
