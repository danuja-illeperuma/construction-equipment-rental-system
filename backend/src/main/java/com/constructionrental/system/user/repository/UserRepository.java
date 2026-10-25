package com.constructionrental.system.user.repository;

import com.constructionrental.system.user.dto.InternalUserCreateRequest;
import com.constructionrental.system.user.dto.InternalUserResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<InternalUserResponse> userRowMapper = (rs, rowNum) -> new InternalUserResponse(
            rs.getLong("user_id"),
            rs.getString("full_name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getString("phone"),
            rs.getBoolean("is_active"),
            rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null
    );

    private final RowMapper<UserSecurityModel> securityRowMapper = (rs, rowNum) -> new UserSecurityModel(
            rs.getLong("user_id"),
            rs.getString("full_name"),
            rs.getString("email"),
            rs.getString("password_hash"),
            rs.getString("role"),
            rs.getString("phone"),
            rs.getBoolean("is_active"),
            rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null
    );

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<InternalUserResponse> findAll() {
        String sql = """
            SELECT
                user_id,
                full_name,
                email,
                role,
                phone,
                is_active,
                created_at
            FROM users
            ORDER BY user_id ASC
            """;
        return jdbcTemplate.query(sql, userRowMapper);
    }

    public Optional<InternalUserResponse> findById(Long id) {
        String sql = """
            SELECT
                user_id,
                full_name,
                email,
                role,
                phone,
                is_active,
                created_at
            FROM users
            WHERE user_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, userRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<InternalUserResponse> findByEmail(String email) {
        String sql = """
            SELECT
                user_id,
                full_name,
                email,
                role,
                phone,
                is_active,
                created_at
            FROM users
            WHERE email = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, userRowMapper, email));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<UserSecurityModel> findActiveByEmail(String email) {
        String sql = """
            SELECT
                user_id,
                full_name,
                email,
                password_hash,
                role,
                phone,
                is_active,
                created_at
            FROM users
            WHERE email = ?
              AND is_active = TRUE
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, securityRowMapper, email));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<UserSecurityModel> findSecurityUserById(Long id) {
        String sql = """
            SELECT
                user_id,
                full_name,
                email,
                password_hash,
                role,
                phone,
                is_active,
                created_at
            FROM users
            WHERE user_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, securityRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public Long save(InternalUserCreateRequest request, String encodedPassword) {
        String sql = """
            INSERT INTO users (
                full_name,
                email,
                password_hash,
                role,
                phone,
                is_active,
                created_at
            ) VALUES (?, ?, ?, ?, ?, TRUE, NOW())
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, request.getFullName());
            ps.setString(2, request.getEmail());
            ps.setString(3, encodedPassword);
            ps.setString(4, request.getRole());
            ps.setString(5, request.getPhone());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public int updateStatus(Long id, boolean isActive) {
        String sql = "UPDATE users SET is_active = ? WHERE user_id = ?";
        return jdbcTemplate.update(sql, isActive, id);
    }
}
