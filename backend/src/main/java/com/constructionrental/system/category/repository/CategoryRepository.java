package com.constructionrental.system.category.repository;

import com.constructionrental.system.category.dto.CategoryCreateRequest;
import com.constructionrental.system.category.dto.CategoryResponse;
import com.constructionrental.system.category.dto.CategoryUpdateRequest;
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

@Repository("featureCategoryRepository")
public class CategoryRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<CategoryResponse> categoryRowMapper = (rs, rowNum) -> new CategoryResponse(
            rs.getLong("category_id"),
            rs.getString("category_name"),
            rs.getString("description"),
            rs.getBoolean("is_active")
    );

    public CategoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CategoryResponse> findAll() {
        String sql = """
            SELECT category_id, category_name, description, is_active
            FROM equipment_categories
            ORDER BY category_id ASC
            """;
        return jdbcTemplate.query(sql, categoryRowMapper);
    }

    public List<CategoryResponse> findActive() {
        String sql = """
            SELECT category_id, category_name, description, is_active
            FROM equipment_categories
            WHERE is_active = 1
            ORDER BY category_id ASC
            """;
        return jdbcTemplate.query(sql, categoryRowMapper);
    }

    public Optional<CategoryResponse> findById(Long id) {
        String sql = """
            SELECT category_id, category_name, description, is_active
            FROM equipment_categories
            WHERE category_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, categoryRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<CategoryResponse> findByName(String name) {
        String sql = """
            SELECT category_id, category_name, description, is_active
            FROM equipment_categories
            WHERE LOWER(category_name) = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, categoryRowMapper, name.toLowerCase()));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsByName(String name) {
        String sql = "SELECT COUNT(*) FROM equipment_categories WHERE LOWER(category_name) = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, name.toLowerCase());
        return count != null && count > 0;
    }

    public boolean existsByNameAndNotId(String name, Long id) {
        String sql = "SELECT COUNT(*) FROM equipment_categories WHERE LOWER(category_name) = ? AND category_id != ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, name.toLowerCase(), id);
        return count != null && count > 0;
    }

    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(*) FROM equipment_categories WHERE category_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }

    public Long save(CategoryCreateRequest request) {
        String sql = """
            INSERT INTO equipment_categories (category_name, description, is_active)
            VALUES (?, ?, 1)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, request.getCategoryName().trim());
            ps.setString(2, request.getDescription() != null ? request.getDescription().trim() : null);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public int update(Long id, CategoryUpdateRequest request) {
        String sql = """
            UPDATE equipment_categories
            SET category_name = ?, description = ?
            WHERE category_id = ?
            """;
        return jdbcTemplate.update(sql,
                request.getCategoryName().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                id);
    }

    public int updateActiveStatus(Long id, boolean isActive) {
        String sql = "UPDATE equipment_categories SET is_active = ? WHERE category_id = ?";
        return jdbcTemplate.update(sql, isActive, id);
    }

    public int delete(Long id) {
        String sql = "DELETE FROM equipment_categories WHERE category_id = ?";
        return jdbcTemplate.update(sql, id);
    }
}
