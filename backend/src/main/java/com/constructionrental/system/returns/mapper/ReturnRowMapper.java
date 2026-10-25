package com.constructionrental.system.returns.mapper;

import com.constructionrental.system.returns.dto.response.EquipmentReturnResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Component
public class ReturnRowMapper implements RowMapper<EquipmentReturnResponse> {

    @Override
    public EquipmentReturnResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        Timestamp returnedAt = rs.getTimestamp("returned_at");
        Timestamp createdAt = rs.getTimestamp("created_at");

        String equipmentCode = null;
        String equipmentName = null;
        String recordedByName = null;
        Long rentalId = null;

        try {
            equipmentCode = rs.getString("equipment_code");
        } catch (SQLException ignored) {}

        try {
            equipmentName = rs.getString("equipment_name");
        } catch (SQLException ignored) {}

        try {
            recordedByName = rs.getString("recorded_by_name");
        } catch (SQLException ignored) {}

        try {
            rentalId = rs.getLong("rental_id");
        } catch (SQLException ignored) {}

        return new EquipmentReturnResponse(
                rs.getLong("return_id"),
                rs.getLong("rental_item_id"),
                rentalId,
                equipmentCode,
                equipmentName,
                returnedAt != null ? returnedAt.toLocalDateTime() : null,
                rs.getString("condition"),
                rs.getBigDecimal("late_charge"),
                rs.getString("notes"),
                rs.getLong("recorded_by"),
                recordedByName,
                createdAt != null ? createdAt.toLocalDateTime() : null
        );
    }
}
