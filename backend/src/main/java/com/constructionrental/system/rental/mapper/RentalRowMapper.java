package com.constructionrental.system.rental.mapper;

import com.constructionrental.system.rental.dto.response.RentalResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Component
public class RentalRowMapper implements RowMapper<RentalResponse> {

    @Override
    public RentalResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        Date startDate = rs.getDate("start_date");
        Date endDate = rs.getDate("end_date");
        Timestamp paymentDeadline = rs.getTimestamp("payment_deadline");
        Timestamp pickupAt = rs.getTimestamp("pickup_at");
        Timestamp createdAt = rs.getTimestamp("created_at");

        String customerName = null;
        String customerPhone = null;
        String paymentStatus = null;

        try {
            customerName = rs.getString("customer_name");
        } catch (SQLException ignored) {}

        try {
            customerPhone = rs.getString("customer_phone");
        } catch (SQLException ignored) {}

        try {
            paymentStatus = rs.getString("payment_status");
        } catch (SQLException ignored) {}

        return new RentalResponse(
                rs.getLong("rental_id"),
                rs.getString("booking_reference"),
                rs.getLong("customer_id"),
                customerName,
                customerPhone,
                startDate != null ? startDate.toLocalDate() : null,
                endDate != null ? endDate.toLocalDate() : null,
                rs.getBigDecimal("total_amount"),
                rs.getString("status"),
                paymentDeadline != null ? paymentDeadline.toLocalDateTime() : null,
                pickupAt != null ? pickupAt.toLocalDateTime() : null,
                createdAt != null ? createdAt.toLocalDateTime() : null,
                paymentStatus
        );
    }
}
