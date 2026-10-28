package com.constructionrental.system.payment.mapper;

import com.constructionrental.system.payment.dto.response.PaymentResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Component
public class PaymentRowMapper implements RowMapper<PaymentResponse> {

    @Override
    public PaymentResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        Timestamp paidAt = rs.getTimestamp("paid_at");
        Timestamp createdAt = rs.getTimestamp("created_at");

        String bookingReference = null;
        try {
            bookingReference = rs.getString("booking_reference");
        } catch (SQLException ignored) {}

        Long customerId = null;
        try {
            long cid = rs.getLong("customer_id");
            if (!rs.wasNull()) {
                customerId = cid;
            }
        } catch (SQLException ignored) {}

        String customerName = null;
        try {
            customerName = rs.getString("customer_name");
        } catch (SQLException ignored) {}

        String rentalStatus = null;
        try {
            rentalStatus = rs.getString("rental_status");
        } catch (SQLException ignored) {}

        return new PaymentResponse(
                rs.getLong("payment_id"),
                rs.getLong("rental_id"),
                customerId,
                customerName,
                bookingReference,
                rs.getBigDecimal("amount"),
                rs.getString("payment_method"),
                rs.getString("payment_status"),
                rs.getString("transaction_reference"),
                paidAt != null ? paidAt.toLocalDateTime() : null,
                createdAt != null ? createdAt.toLocalDateTime() : null,
                rentalStatus
        );
    }
}
