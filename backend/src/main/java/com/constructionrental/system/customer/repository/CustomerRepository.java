package com.constructionrental.system.customer.repository;

import com.constructionrental.system.customer.dto.CustomerProfileUpdateRequest;
import com.constructionrental.system.customer.dto.CustomerRegisterRequest;
import com.constructionrental.system.customer.dto.CustomerResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class CustomerRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<CustomerResponse> customerRowMapper = (rs, rowNum) -> new CustomerResponse(
            rs.getLong("customer_id"),
            rs.getString("customer_type"),
            rs.getString("name"),
            rs.getString("nic_or_br_number"),
            rs.getString("phone"),
            rs.getString("email"),
            rs.getString("address"),
            rs.getBoolean("is_active"),
            rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null
    );

    private final RowMapper<CustomerSecurityModel> securityRowMapper = (rs, rowNum) -> new CustomerSecurityModel(
            rs.getLong("customer_id"),
            rs.getString("customer_type"),
            rs.getString("name"),
            rs.getString("nic_or_br_number"),
            rs.getString("phone"),
            rs.getString("email"),
            rs.getString("password_hash"),
            rs.getString("address"),
            rs.getBoolean("is_active"),
            rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null
    );

    public CustomerRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Retrieves all active customers using the MySQL View `view_active_customers`.
     */
    public List<CustomerResponse> findAll() {
        String sql = """
            SELECT
                customer_id,
                customer_type,
                name,
                nic_or_br_number,
                phone,
                email,
                address,
                1 AS is_active,
                created_at
            FROM view_active_customers
            ORDER BY customer_id DESC
            """;
        return jdbcTemplate.query(sql, customerRowMapper);
    }

    public Optional<CustomerResponse> findById(Long id) {
        String sql = """
            SELECT
                customer_id,
                customer_type,
                name,
                nic_or_br_number,
                phone,
                email,
                address,
                is_active,
                created_at
            FROM customers
            WHERE customer_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, customerRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<CustomerResponse> findByEmail(String email) {
        String sql = """
            SELECT
                customer_id,
                customer_type,
                name,
                nic_or_br_number,
                phone,
                email,
                address,
                is_active,
                created_at
            FROM customers
            WHERE email = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, customerRowMapper, email));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<CustomerSecurityModel> findActiveByEmail(String email) {
        String sql = """
            SELECT
                customer_id,
                customer_type,
                name,
                nic_or_br_number,
                phone,
                email,
                password_hash,
                address,
                is_active,
                created_at
            FROM customers
            WHERE email = ?
              AND is_active = TRUE
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, securityRowMapper, email));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<CustomerSecurityModel> findSecurityCustomerById(Long id) {
        String sql = """
            SELECT
                customer_id,
                customer_type,
                name,
                nic_or_br_number,
                phone,
                email,
                password_hash,
                address,
                is_active,
                created_at
            FROM customers
            WHERE customer_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, securityRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM customers WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public boolean existsByEmailAndNotId(String email, Long id) {
        String sql = "SELECT COUNT(*) FROM customers WHERE email = ? AND customer_id != ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email, id);
        return count != null && count > 0;
    }

    public boolean existsByPhone(String phone) {
        String sql = "SELECT COUNT(*) FROM customers WHERE phone = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, phone);
        return count != null && count > 0;
    }

    public boolean existsByPhoneAndNotId(String phone, Long id) {
        String sql = "SELECT COUNT(*) FROM customers WHERE phone = ? AND customer_id != ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, phone, id);
        return count != null && count > 0;
    }

    public Long save(CustomerRegisterRequest request, String encodedPassword) {
        String sql = """
            INSERT INTO customers (
                customer_type,
                name,
                nic_or_br_number,
                phone,
                email,
                password_hash,
                address,
                1 AS is_active,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, request.getCustomerType());
            ps.setString(2, request.getName());
            ps.setString(3, request.getNicOrBrNumber());
            ps.setString(4, request.getPhone());
            ps.setString(5, request.getEmail());
            ps.setString(6, encodedPassword);
            ps.setString(7, request.getAddress());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public int updateProfile(Long id, CustomerProfileUpdateRequest request) {
        String sql = """
            UPDATE customers
            SET name = ?, nic_or_br_number = ?, phone = ?, address = ?
            WHERE customer_id = ?
            """;
        return jdbcTemplate.update(sql,
                request.getName(),
                request.getNicOrBrNumber(),
                request.getPhone(),
                request.getAddress(),
                id);
    }

    /**
     * Executes MySQL User-Defined Function `fn_customer_booking_count(p_customer_id)`.
     */
    public int getCustomerBookingCount(Long customerId) {
        String sql = "SELECT fn_customer_booking_count(?)";
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, customerId);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Updates customer status using MySQL Stored Procedure `sp_toggle_customer_active`.
     */
    public int updateStatus(Long id, boolean isActive) {
        return jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.CallableStatement cs = conn.prepareCall("{CALL sp_toggle_customer_active(?, ?, ?, ?)}")) {
                cs.setLong(1, id);
                cs.setBoolean(2, isActive);
                cs.registerOutParameter(3, java.sql.Types.BOOLEAN);
                cs.registerOutParameter(4, java.sql.Types.VARCHAR);
                cs.execute();

                boolean success = cs.getBoolean(3);
                String message = cs.getString(4);
                if (!success) {
                    throw new com.constructionrental.system.common.exception.BadRequestException(message);
                }
                return 1;
            } catch (java.sql.SQLException e) {
                if (e.getErrorCode() == 1644 || "45000".equals(e.getSQLState())) {
                    throw new com.constructionrental.system.common.exception.BadRequestException(e.getMessage());
                }
                String fallbackSql = "UPDATE customers SET is_active = ? WHERE customer_id = ?";
                try (java.sql.PreparedStatement ps = conn.prepareStatement(fallbackSql)) {
                    ps.setBoolean(1, isActive);
                    ps.setLong(2, id);
                    return ps.executeUpdate();
                }
            }
        });
    }
}
