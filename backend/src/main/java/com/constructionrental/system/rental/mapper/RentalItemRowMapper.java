package com.constructionrental.system.rental.mapper;

import com.constructionrental.system.rental.dto.response.RentalItemResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class RentalItemRowMapper implements RowMapper<RentalItemResponse> {

    @Override
    public RentalItemResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        String equipmentCode = null;
        String equipmentName = null;
        boolean isReturned = false;

        try {
            equipmentCode = rs.getString("equipment_code");
        } catch (SQLException ignored) {}

        try {
            equipmentName = rs.getString("equipment_name");
        } catch (SQLException ignored) {}

        try {
            isReturned = rs.getLong("return_id") > 0;
        } catch (SQLException ignored) {}

        return new RentalItemResponse(
                rs.getLong("rental_item_id"),
                rs.getLong("rental_id"),
                rs.getLong("equipment_id"),
                equipmentCode,
                equipmentName,
                rs.getString("rental_type"),
                rs.getInt("quantity"),
                rs.getBigDecimal("duration"),
                rs.getBigDecimal("unit_rate"),
                rs.getBigDecimal("item_amount"),
                isReturned
        );
    }
}
