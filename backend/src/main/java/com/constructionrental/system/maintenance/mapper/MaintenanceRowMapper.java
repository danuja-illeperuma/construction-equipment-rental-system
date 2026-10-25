package com.constructionrental.system.maintenance.mapper;

import com.constructionrental.system.maintenance.dto.response.MaintenanceResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Component
public class MaintenanceRowMapper implements RowMapper<MaintenanceResponse> {

    @Override
    public MaintenanceResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        Date maintenanceDate = rs.getDate("maintenance_date");
        Date nextMaintenanceDate = rs.getDate("next_maintenance_date");
        Timestamp createdAt = rs.getTimestamp("created_at");

        String equipmentCode = null;
        String equipmentName = null;
        String recordedByName = null;
        Long customerId = null;
        String customerName = null;
        String customerPhone = null;
        Boolean isPaid = null;
        Timestamp paidAt = null;

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
            long cId = rs.getLong("customer_id");
            if (!rs.wasNull()) {
                customerId = cId;
            }
        } catch (SQLException ignored) {}

        try {
            customerName = rs.getString("customer_name");
        } catch (SQLException ignored) {}

        try {
            customerPhone = rs.getString("customer_phone");
        } catch (SQLException ignored) {}

        try {
            boolean paid = rs.getBoolean("is_paid");
            if (!rs.wasNull()) {
                isPaid = paid;
            }
        } catch (SQLException ignored) {}

        try {
            paidAt = rs.getTimestamp("paid_at");
        } catch (SQLException ignored) {}

        return new MaintenanceResponse(
                rs.getLong("maintenance_id"),
                rs.getLong("equipment_id"),
                equipmentCode,
                equipmentName,
                rs.getString("maintenance_type"),
                rs.getString("description"),
                rs.getBigDecimal("maintenance_cost"),
                maintenanceDate != null ? maintenanceDate.toLocalDate() : null,
                nextMaintenanceDate != null ? nextMaintenanceDate.toLocalDate() : null,
                rs.getString("status"),
                rs.getString("notes"),
                rs.getLong("recorded_by"),
                recordedByName,
                createdAt != null ? createdAt.toLocalDateTime() : null,
                customerId,
                customerName,
                customerPhone,
                isPaid,
                paidAt != null ? paidAt.toLocalDateTime() : null
        );
    }
}
