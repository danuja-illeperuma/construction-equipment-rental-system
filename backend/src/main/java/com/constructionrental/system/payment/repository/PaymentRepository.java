package com.constructionrental.system.payment.repository;

import com.constructionrental.system.payment.dto.response.PaymentResponse;
import com.constructionrental.system.payment.dto.response.SuccessfulPaymentResponse;
import com.constructionrental.system.payment.mapper.PaymentRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public class PaymentRepository {

    private final JdbcTemplate jdbcTemplate;
    private final PaymentRowMapper paymentRowMapper;

    public PaymentRepository(JdbcTemplate jdbcTemplate, PaymentRowMapper paymentRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.paymentRowMapper = paymentRowMapper;
    }

    public Optional<PaymentResponse> findById(Long id) {
        String sql = """
            SELECT p.payment_id, p.rental_id, r.customer_id, r.booking_reference, p.amount,
                   p.payment_method, p.payment_status, p.transaction_reference,
                   p.paid_at, p.created_at, r.status AS rental_status
            FROM payments p
            JOIN rentals r ON p.rental_id = r.rental_id
            WHERE p.payment_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, paymentRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<PaymentResponse> findByRentalId(Long rentalId) {
        String sql = """
            SELECT p.payment_id, p.rental_id, r.customer_id, r.booking_reference, p.amount,
                   p.payment_method, p.payment_status, p.transaction_reference,
                   p.paid_at, p.created_at, r.status AS rental_status
            FROM payments p
            JOIN rentals r ON p.rental_id = r.rental_id
            WHERE p.rental_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, paymentRowMapper, rentalId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<PaymentResponse> findByBookingReference(String bookingReference) {
        String sql = """
            SELECT p.payment_id, p.rental_id, r.customer_id, r.booking_reference, p.amount,
                   p.payment_method, p.payment_status, p.transaction_reference,
                   p.paid_at, p.created_at, r.status AS rental_status
            FROM payments p
            JOIN rentals r ON p.rental_id = r.rental_id
            WHERE r.booking_reference = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, paymentRowMapper, bookingReference));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<PaymentResponse> findAll(String status) {
        if (status != null && !status.isBlank()) {
            String sql = """
                SELECT p.payment_id, p.rental_id, r.customer_id, r.booking_reference, p.amount,
                       p.payment_method, p.payment_status, p.transaction_reference,
                       p.paid_at, p.created_at, r.status AS rental_status
                FROM payments p
                JOIN rentals r ON p.rental_id = r.rental_id
                WHERE p.payment_status = ?
                ORDER BY p.created_at DESC
                """;
            return jdbcTemplate.query(sql, paymentRowMapper, status.toUpperCase());
        }
        String sql = """
            SELECT p.payment_id, p.rental_id, r.customer_id, r.booking_reference, p.amount,
                   p.payment_method, p.payment_status, p.transaction_reference,
                   p.paid_at, p.created_at, r.status AS rental_status
            FROM payments p
            JOIN rentals r ON p.rental_id = r.rental_id
            ORDER BY p.created_at DESC
            """;
        return jdbcTemplate.query(sql, paymentRowMapper);
    }

    public List<PaymentResponse> findByCustomerId(Long customerId) {
        String sql = """
            SELECT p.payment_id, p.rental_id, r.customer_id, r.booking_reference, p.amount,
                   p.payment_method, p.payment_status, p.transaction_reference,
                   p.paid_at, p.created_at, r.status AS rental_status
            FROM payments p
            JOIN rentals r ON p.rental_id = r.rental_id
            WHERE r.customer_id = ?
            ORDER BY p.created_at DESC
            """;
        return jdbcTemplate.query(sql, paymentRowMapper, customerId);
    }

    /**
     * Retrieves all successful payments using MySQL View `view_successful_payments`.
     */
    public List<SuccessfulPaymentResponse> findSuccessfulPayments() {
        String sql = """
            SELECT payment_id, transaction_reference, booking_reference,
                   customer_name, amount, payment_method, paid_at
            FROM view_successful_payments
            ORDER BY paid_at DESC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            java.sql.Timestamp ts = rs.getTimestamp("paid_at");
            return new SuccessfulPaymentResponse(
                    rs.getLong("payment_id"),
                    rs.getString("transaction_reference"),
                    rs.getString("booking_reference"),
                    rs.getString("customer_name"),
                    rs.getBigDecimal("amount"),
                    rs.getString("payment_method"),
                    ts != null ? ts.toLocalDateTime() : null
            );
        });
    }

    /**
     * Creates or reuses a payment record using pure SQL.
     */
    public Long callCreatePayment(Long rentalId, String paymentMethod) {
        // Look up existing payment if any
        String checkSql = "SELECT payment_id FROM payments WHERE rental_id = ?";
        List<Long> existing = jdbcTemplate.queryForList(checkSql, Long.class, rentalId);
        if (!existing.isEmpty()) {
            Long paymentId = existing.get(0);
            jdbcTemplate.update("UPDATE payments SET payment_method = ?, payment_status = 'PENDING' WHERE payment_id = ?",
                    paymentMethod, paymentId);
            return paymentId;
        }

        org.springframework.jdbc.support.KeyHolder keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            java.sql.PreparedStatement ps = connection.prepareStatement(
                "INSERT INTO payments (rental_id, amount, payment_method, payment_status, created_at) " +
                "SELECT rental_id, total_amount, ?, 'PENDING', NOW() FROM rentals WHERE rental_id = ?",
                java.sql.Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, paymentMethod);
            ps.setLong(2, rentalId);
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    /**
     * Executes MySQL Stored Procedure `sp_process_payment_transaction` which manages
     * an explicit MySQL database transaction (START TRANSACTION ... COMMIT / ROLLBACK).
     * Transaction atomicity is handled entirely within MySQL, without Spring @Transactional.
     */
    public void callProcessPayment(Long paymentId, String paymentStatus, String transactionReference) {
        jdbcTemplate.update("CALL sp_process_payment_transaction(?, ?, ?)",
                paymentId, paymentStatus, transactionReference);
    }
}
