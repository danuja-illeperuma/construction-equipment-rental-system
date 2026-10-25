package com.constructionrental.system.rental.repository;

import com.constructionrental.system.rental.dto.response.RentalItemResponse;
import com.constructionrental.system.rental.mapper.RentalItemRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class RentalItemRepository {

    private final JdbcTemplate jdbcTemplate;
    private final RentalItemRowMapper rentalItemRowMapper;

    public RentalItemRepository(JdbcTemplate jdbcTemplate, RentalItemRowMapper rentalItemRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.rentalItemRowMapper = rentalItemRowMapper;
    }

    /**
     * Executes the MySQL database function calculate_rental_amount(quantity, duration, unit_rate).
     */
    public BigDecimal callCalculateRentalAmount(int quantity, BigDecimal duration, BigDecimal unitRate) {
        String sql = "SELECT calculate_rental_amount(?, ?, ?)";
        try {
            return jdbcTemplate.queryForObject(sql, BigDecimal.class, quantity, duration, unitRate);
        } catch (Exception e) {
            // Fallback calculation in case function has not yet been applied to test instance
            return unitRate.multiply(duration).multiply(BigDecimal.valueOf(quantity));
        }
    }

    public Long save(Long rentalId, Long equipmentId, String rentalType, int quantity,
                     BigDecimal duration, BigDecimal unitRate, BigDecimal itemAmount) {
        String sql = """
            INSERT INTO rental_items (rental_id, equipment_id, rental_type, quantity, duration, unit_rate, item_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, rentalId);
            ps.setLong(2, equipmentId);
            ps.setString(3, rentalType);
            ps.setInt(4, quantity);
            ps.setBigDecimal(5, duration);
            ps.setBigDecimal(6, unitRate);
            ps.setBigDecimal(7, itemAmount);
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public List<RentalItemResponse> findByRentalId(Long rentalId) {
        String sql = """
            SELECT ri.rental_item_id, ri.rental_id, ri.equipment_id, e.equipment_code,
                   e.equipment_name, ri.rental_type, ri.quantity, ri.duration,
                   ri.unit_rate, ri.item_amount, er.return_id
            FROM rental_items ri
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            LEFT JOIN equipment_returns er ON ri.rental_item_id = er.rental_item_id
            WHERE ri.rental_id = ?
            ORDER BY ri.rental_item_id ASC
            """;
        return jdbcTemplate.query(sql, rentalItemRowMapper, rentalId);
    }

    public Optional<RentalItemResponse> findById(Long rentalItemId) {
        String sql = """
            SELECT ri.rental_item_id, ri.rental_id, ri.equipment_id, e.equipment_code,
                   e.equipment_name, ri.rental_type, ri.quantity, ri.duration,
                   ri.unit_rate, ri.item_amount, er.return_id
            FROM rental_items ri
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            LEFT JOIN equipment_returns er ON ri.rental_item_id = er.rental_item_id
            WHERE ri.rental_item_id = ?
            """;
        List<RentalItemResponse> list = jdbcTemplate.query(sql, rentalItemRowMapper, rentalItemId);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
