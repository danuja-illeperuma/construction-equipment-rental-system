package com.constructionrental.system.rental.repository;

import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.common.exception.ResourceNotFoundException;
import com.constructionrental.system.rental.dto.response.ActiveRentalResponse;
import com.constructionrental.system.rental.dto.response.RentalResponse;
import com.constructionrental.system.rental.mapper.RentalRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class RentalRepository {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final RentalRowMapper rentalRowMapper;

    public RentalRepository(JdbcTemplate jdbcTemplate,
                            NamedParameterJdbcTemplate namedParameterJdbcTemplate,
                            RentalRowMapper rentalRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.rentalRowMapper = rentalRowMapper;
    }

    /**
     * Checks equipment availability using the canonical CERMS date-overlap logic:
     * Overlap occurs when: r.status IN ('PENDING_PAYMENT','CONFIRMED','ACTIVE')
     * AND r.start_date <= requested_end_date AND r.end_date >= requested_start_date.
     * Optionally excludes a specific rental ID.
     */
    public boolean checkEquipmentAvailability(Long equipmentId, LocalDate startDate, LocalDate endDate, Long excludeRentalId) {
        String sql = """
            SELECT COUNT(*)
            FROM rental_items ri
            JOIN rentals r ON r.rental_id = ri.rental_id
            WHERE ri.equipment_id = ?
              AND r.status IN ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE')
              AND r.start_date <= ?
              AND r.end_date >= ?
              AND (? IS NULL OR r.rental_id <> ?)
            """;
        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                equipmentId,
                Date.valueOf(endDate),
                Date.valueOf(startDate),
                excludeRentalId,
                excludeRentalId
        );
        return count != null && count == 0;
    }

    /**
     * Checks multiple equipment IDs for overlapping bookings.
     */
    public List<Long> findConflictingEquipment(List<Long> equipmentIds, LocalDate startDate, LocalDate endDate, Long excludeRentalId) {
        if (equipmentIds == null || equipmentIds.isEmpty()) {
            return List.of();
        }

        String sql = """
            SELECT DISTINCT ri.equipment_id
            FROM rental_items ri
            JOIN rentals r ON ri.rental_id = r.rental_id
            WHERE ri.equipment_id IN (:equipmentIds)
              AND r.status IN ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE')
              AND r.start_date <= :endDate
              AND r.end_date >= :startDate
              AND (:excludeRentalId IS NULL OR r.rental_id <> :excludeRentalId)
            """;

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("equipmentIds", equipmentIds);
        params.addValue("startDate", Date.valueOf(startDate));
        params.addValue("endDate", Date.valueOf(endDate));
        params.addValue("excludeRentalId", excludeRentalId);

        return namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) -> rs.getLong("equipment_id"));
    }

    public List<Long> findConflictingEquipment(List<Long> equipmentIds, LocalDate startDate, LocalDate endDate) {
        return findConflictingEquipment(equipmentIds, startDate, endDate, null);
    }

    /**
     * Acquires a row-level pessimistic lock on the equipment table row.
     * Prevents race conditions during concurrent booking attempts.
     */
    public void lockEquipmentRow(Long equipmentId) {
        String sql = "SELECT equipment_id FROM equipment WHERE equipment_id = ? FOR UPDATE";
        try {
            jdbcTemplate.queryForObject(sql, Long.class, equipmentId);
        } catch (EmptyResultDataAccessException e) {
            throw new ResourceNotFoundException("Equipment not found with ID: " + equipmentId);
        }
    }

    /**
     * Validates that customer exists and is active.
     */
    public boolean isCustomerActive(Long customerId) {
        String sql = "SELECT COUNT(*) FROM customers WHERE customer_id = ? AND is_active = 1";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, customerId);
        return count != null && count > 0;
    }

    /**
     * Creates a rental header in PENDING_PAYMENT status with total_amount = 0.00.
     */
    public Long createRentalHeader(Long customerId, String bookingReference, LocalDate startDate,
                                  LocalDate endDate, LocalDateTime paymentDeadline) {
        String sql = """
            INSERT INTO rentals (booking_reference, customer_id, start_date, end_date, total_amount, status, payment_deadline, created_at)
            VALUES (?, ?, ?, ?, 0.00, 'PENDING_PAYMENT', COALESCE(?, DATE_ADD(NOW(), INTERVAL 15 MINUTE)), NOW())
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, bookingReference);
            ps.setLong(2, customerId);
            ps.setDate(3, Date.valueOf(startDate));
            ps.setDate(4, Date.valueOf(endDate));
            ps.setTimestamp(5, paymentDeadline != null ? Timestamp.valueOf(paymentDeadline) : null);
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public Long save(Long customerId, String bookingReference, LocalDate startDate,
                     LocalDate endDate, BigDecimal totalAmount, LocalDateTime paymentDeadline) {
        String sql = """
            INSERT INTO rentals (booking_reference, customer_id, start_date, end_date, total_amount, status, payment_deadline, created_at)
            VALUES (?, ?, ?, ?, ?, 'PENDING_PAYMENT', COALESCE(?, DATE_ADD(NOW(), INTERVAL 15 MINUTE)), NOW())
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, bookingReference);
            ps.setLong(2, customerId);
            ps.setDate(3, Date.valueOf(startDate));
            ps.setDate(4, Date.valueOf(endDate));
            ps.setBigDecimal(5, totalAmount);
            ps.setTimestamp(6, paymentDeadline != null ? Timestamp.valueOf(paymentDeadline) : null);
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public Optional<RentalResponse> findById(Long id) {
        String sql = """
            SELECT r.rental_id, r.booking_reference, r.customer_id, c.name AS customer_name,
                   c.phone AS customer_phone, r.start_date, r.end_date, r.total_amount,
                   r.status, r.payment_deadline, r.pickup_at, r.created_at, p.payment_status
            FROM rentals r
            JOIN customers c ON r.customer_id = c.customer_id
            LEFT JOIN payments p ON r.rental_id = p.rental_id
            WHERE r.rental_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rentalRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<RentalResponse> findByBookingReference(String bookingReference) {
        String sql = """
            SELECT r.rental_id, r.booking_reference, r.customer_id, c.name AS customer_name,
                   c.phone AS customer_phone, r.start_date, r.end_date, r.total_amount,
                   r.status, r.payment_deadline, r.pickup_at, r.created_at, p.payment_status
            FROM rentals r
            JOIN customers c ON r.customer_id = c.customer_id
            LEFT JOIN payments p ON r.rental_id = p.rental_id
            WHERE r.booking_reference = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rentalRowMapper, bookingReference));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<RentalResponse> findByCustomerId(Long customerId) {
        String sql = """
            SELECT r.rental_id, r.booking_reference, r.customer_id, c.name AS customer_name,
                   c.phone AS customer_phone, r.start_date, r.end_date, r.total_amount,
                   r.status, r.payment_deadline, r.pickup_at, r.created_at, p.payment_status
            FROM rentals r
            JOIN customers c ON r.customer_id = c.customer_id
            LEFT JOIN payments p ON r.rental_id = p.rental_id
            WHERE r.customer_id = ?
            ORDER BY r.rental_id DESC
            """;
        return jdbcTemplate.query(sql, rentalRowMapper, customerId);
    }

    public List<RentalResponse> findAll(String status) {
        StringBuilder sql = new StringBuilder("""
            SELECT r.rental_id, r.booking_reference, r.customer_id, c.name AS customer_name,
                   c.phone AS customer_phone, r.start_date, r.end_date, r.total_amount,
                   r.status, r.payment_deadline, r.pickup_at, r.created_at, p.payment_status
            FROM rentals r
            JOIN customers c ON r.customer_id = c.customer_id
            LEFT JOIN payments p ON r.rental_id = p.rental_id
            WHERE 1=1
            """);

        List<Object> params = new ArrayList<>();
        if (status != null && !status.isBlank()) {
            sql.append(" AND r.status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY r.rental_id DESC");

        return jdbcTemplate.query(sql.toString(), rentalRowMapper, params.toArray());
    }

    public int updateStatus(Long rentalId, String status) {
        String sql = "UPDATE rentals SET status = ? WHERE rental_id = ?";
        return jdbcTemplate.update(sql, status, rentalId);
    }

    public int recordPickup(Long rentalId, LocalDateTime pickupAt) {
        String sql = """
            UPDATE rentals
            SET pickup_at = ?, status = 'ACTIVE'
            WHERE rental_id = ?
            """;
        return jdbcTemplate.update(sql, Timestamp.valueOf(pickupAt), rentalId);
    }

    public int updateTotalAmount(Long rentalId, BigDecimal totalAmount) {
        String sql = "UPDATE rentals SET total_amount = ? WHERE rental_id = ?";
        return jdbcTemplate.update(sql, totalAmount, rentalId);
    }

    /**
     * Retrieves active rentals using MySQL View `view_active_rentals`.
     */
    public List<ActiveRentalResponse> findActiveRentals() {
        String sql = """
            SELECT
                rental_id,
                booking_reference,
                customer_name,
                customer_phone,
                start_date,
                end_date,
                total_amount,
                status
            FROM view_active_rentals
            ORDER BY rental_id DESC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ActiveRentalResponse(
                rs.getLong("rental_id"),
                rs.getString("booking_reference"),
                rs.getString("customer_name"),
                rs.getString("customer_phone"),
                rs.getDate("start_date") != null ? rs.getDate("start_date").toLocalDate() : null,
                rs.getDate("end_date") != null ? rs.getDate("end_date").toLocalDate() : null,
                rs.getBigDecimal("total_amount"),
                rs.getString("status")
        ));
    }

    /**
     * Cancels an eligible rental (PENDING_PAYMENT or CONFIRMED)
     * using MySQL Stored Procedure `sp_cancel_rental`.
     */
    public void cancelRental(Long rentalId) {
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.CallableStatement cs = conn.prepareCall("{CALL sp_cancel_rental(?)}")) {
                cs.setLong(1, rentalId);
                cs.execute();
                return null;
            } catch (java.sql.SQLException e) {
                if (e.getErrorCode() == 1644 || "45000".equals(e.getSQLState())) {
                    throw new BadRequestException(e.getMessage());
                }
                // Fallback to direct update if procedure is not found
                updateStatus(rentalId, "CANCELLED");
                return null;
            }
        });
    }
}
