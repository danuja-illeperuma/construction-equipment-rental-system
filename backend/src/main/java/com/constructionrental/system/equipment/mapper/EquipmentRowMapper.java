package com.constructionrental.system.equipment.mapper;

import com.constructionrental.system.equipment.dto.response.EquipmentResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Component
public class EquipmentRowMapper implements RowMapper<EquipmentResponse> {

    @Override
    public EquipmentResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        Timestamp createdAtTimestamp = rs.getTimestamp("created_at");

        String categoryName = null;
        try {
            categoryName = rs.getString("category_name");
        } catch (SQLException ignored) {
            // category_name may not be present in all queries
        }

        String primaryImageUrl = null;
        try {
            primaryImageUrl = rs.getString("primary_image_url");
        } catch (SQLException ignored) {
            // primary_image_url may not be present in all queries
        }

        return new EquipmentResponse(
                rs.getLong("equipment_id"),
                rs.getString("equipment_code"),
                rs.getString("equipment_name"),
                rs.getLong("category_id"),
                categoryName,
                rs.getString("brand"),
                rs.getString("model"),
                rs.getBigDecimal("hourly_rate"),
                rs.getBigDecimal("daily_rate"),
                rs.getBigDecimal("monthly_rate"),
                rs.getString("status"),
                rs.getString("location"),
                rs.getBoolean("is_active"),
                createdAtTimestamp != null ? createdAtTimestamp.toLocalDateTime() : null,
                primaryImageUrl
        );
    }
}
