package com.constructionrental.system.equipment.repository;

import com.constructionrental.system.common.exception.BadRequestException;
import com.constructionrental.system.equipment.dto.EquipmentCreateRequest;
import com.constructionrental.system.equipment.dto.EquipmentImageDto;
import com.constructionrental.system.equipment.dto.EquipmentUpdateRequest;
import com.constructionrental.system.equipment.dto.response.AvailableEquipmentResponse;
import com.constructionrental.system.equipment.dto.response.EquipmentResponse;
import com.constructionrental.system.equipment.mapper.EquipmentRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class EquipmentRepository {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final EquipmentRowMapper equipmentRowMapper;

    public EquipmentRepository(JdbcTemplate jdbcTemplate,
                               NamedParameterJdbcTemplate namedParameterJdbcTemplate,
                               EquipmentRowMapper equipmentRowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.equipmentRowMapper = equipmentRowMapper;
    }

    public List<EquipmentResponse> findFiltered(String search, Long categoryId, String status,
                                                Boolean active) {
        StringBuilder sql = new StringBuilder("""
            SELECT
                e.equipment_id,
                e.equipment_code,
                e.equipment_name,
                e.category_id,
                c.category_name,
                e.brand,
                e.model,
                e.hourly_rate,
                e.daily_rate,
                e.monthly_rate,
                e.status,
                e.location,
                e.is_active,
                e.created_at,
                e.primary_image_url
            FROM equipment e
            JOIN equipment_categories c
                ON e.category_id = c.category_id
            WHERE 1=1
            """);

        MapSqlParameterSource params = new MapSqlParameterSource();

        if (search != null && !search.isBlank()) {
            sql.append("""
                 AND (LOWER(e.equipment_name) LIKE :searchTerm
                      OR LOWER(e.equipment_code) LIKE :searchTerm
                      OR LOWER(e.brand) LIKE :searchTerm
                      OR LOWER(e.model) LIKE :searchTerm)
                """);
            params.addValue("searchTerm", "%" + search.trim().toLowerCase() + "%");
        }

        if (categoryId != null) {
            sql.append(" AND e.category_id = :categoryId");
            params.addValue("categoryId", categoryId);
        }

        if (status != null && !status.isBlank()) {
            sql.append(" AND e.status = :status");
            params.addValue("status", status.trim().toUpperCase());
        }

        if (active != null) {
            sql.append(" AND e.is_active = :active");
            params.addValue("active", active ? 1 : 0);
        }

        sql.append(" ORDER BY e.equipment_id DESC");

        return namedParameterJdbcTemplate.query(sql.toString(), params, equipmentRowMapper);
    }

    @Deprecated
    public List<EquipmentResponse> findFiltered(String search, Long categoryId, String status,
                                                Boolean active, Boolean operatorAvailable) {
        return findFiltered(search, categoryId, status, active);
    }

    public List<EquipmentResponse> findAll(Long categoryId, String status, String search) {
        return findFiltered(search, categoryId, status, true);
    }

    public Optional<EquipmentResponse> findById(Long id) {
        String sql = """
            SELECT
                e.equipment_id,
                e.equipment_code,
                e.equipment_name,
                e.category_id,
                c.category_name,
                e.brand,
                e.model,
                e.hourly_rate,
                e.daily_rate,
                e.monthly_rate,
                e.status,
                e.location,
                e.is_active,
                e.created_at,
                e.primary_image_url
            FROM equipment e
            JOIN equipment_categories c
                ON e.category_id = c.category_id
            WHERE e.equipment_id = ?
            """;
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, equipmentRowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(*) FROM equipment WHERE equipment_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }

    public boolean existsByEquipmentCode(String equipmentCode) {
        String sql = "SELECT COUNT(*) FROM equipment WHERE LOWER(equipment_code) = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, equipmentCode.trim().toLowerCase());
        return count != null && count > 0;
    }

    public boolean existsByEquipmentCodeAndNotId(String equipmentCode, Long id) {
        String sql = "SELECT COUNT(*) FROM equipment WHERE LOWER(equipment_code) = ? AND equipment_id != ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, equipmentCode.trim().toLowerCase(), id);
        return count != null && count > 0;
    }

    public Long save(EquipmentCreateRequest request) {
        String sql = """
            INSERT INTO equipment (
                equipment_code,
                equipment_name,
                category_id,
                brand,
                model,
                hourly_rate,
                daily_rate,
                monthly_rate,
                status,
                location,
                is_active,
                created_at,
                primary_image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, 1, NOW(), ?)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, request.getEquipmentCode().trim());
            ps.setString(2, request.getEquipmentName().trim());
            ps.setLong(3, request.getCategoryId());
            ps.setString(4, request.getBrand() != null ? request.getBrand().trim() : null);
            ps.setString(5, request.getModel() != null ? request.getModel().trim() : null);
            ps.setBigDecimal(6, request.getHourlyRate());
            ps.setBigDecimal(7, request.getDailyRate());
            ps.setBigDecimal(8, request.getMonthlyRate());
            ps.setString(9, request.getLocation() != null ? request.getLocation().trim() : null);
            ps.setString(10, request.getPrimaryImageUrl() != null && !request.getPrimaryImageUrl().isBlank()
                    ? request.getPrimaryImageUrl().trim() : null);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public int update(Long id, EquipmentUpdateRequest request) {
        String sql = """
            UPDATE equipment
            SET equipment_code = ?,
                equipment_name = ?,
                category_id = ?,
                brand = ?,
                model = ?,
                hourly_rate = ?,
                daily_rate = ?,
                monthly_rate = ?,
                location = ?,
                primary_image_url = ?
            WHERE equipment_id = ?
            """;
        return jdbcTemplate.update(sql,
                request.getEquipmentCode().trim(),
                request.getEquipmentName().trim(),
                request.getCategoryId(),
                request.getBrand() != null ? request.getBrand().trim() : null,
                request.getModel() != null ? request.getModel().trim() : null,
                request.getHourlyRate(),
                request.getDailyRate(),
                request.getMonthlyRate(),
                request.getLocation() != null ? request.getLocation().trim() : null,
                request.getPrimaryImageUrl() != null && !request.getPrimaryImageUrl().isBlank()
                        ? request.getPrimaryImageUrl().trim() : null,
                id);
    }

    public int updateActiveStatus(Long id, boolean isActive) {
        String sql = "UPDATE equipment SET is_active = ? WHERE equipment_id = ?";
        return jdbcTemplate.update(sql, isActive, id);
    }

    /**
     * Updates equipment operational status (AVAILABLE, RENTED, MAINTENANCE)
     * using MySQL Stored Procedure `sp_update_equipment_status`.
     */
    public int updateStatus(Long id, String status) {
        return jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.CallableStatement cs = conn.prepareCall("{CALL sp_update_equipment_status(?, ?, ?)}")) {
                cs.setLong(1, id);
                cs.setString(2, status != null ? status.trim().toUpperCase() : null);
                cs.registerOutParameter(3, java.sql.Types.BOOLEAN);
                cs.execute();

                boolean success = cs.getBoolean(3);
                if (!success) {
                    throw new BadRequestException("Failed to update equipment status");
                }
                return 1;
            } catch (java.sql.SQLException e) {
                if (e.getErrorCode() == 1644 || "45000".equals(e.getSQLState())) {
                    throw new BadRequestException(e.getMessage());
                }
                // Fallback to direct UPDATE if procedure invocation is unavailable
                String fallbackSql = "UPDATE equipment SET status = ? WHERE equipment_id = ?";
                try (java.sql.PreparedStatement ps = conn.prepareStatement(fallbackSql)) {
                    ps.setString(1, status);
                    ps.setLong(2, id);
                    return ps.executeUpdate();
                }
            }
        });
    }

    /**
     * Retrieves available equipment catalog using MySQL View `view_available_equipment`.
     */
    public List<AvailableEquipmentResponse> findAvailableCatalog() {
        String sql = """
            SELECT
                equipment_id,
                equipment_code,
                equipment_name,
                category_name,
                daily_rate,
                hourly_rate,
                monthly_rate,
                status
            FROM view_available_equipment
            ORDER BY equipment_id DESC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new AvailableEquipmentResponse(
                rs.getLong("equipment_id"),
                rs.getString("equipment_code"),
                rs.getString("equipment_name"),
                rs.getString("category_name"),
                rs.getBigDecimal("daily_rate"),
                rs.getBigDecimal("hourly_rate"),
                rs.getBigDecimal("monthly_rate"),
                rs.getString("status")
        ));
    }

    /**
     * Retrieves daily rental rate using MySQL Scalar Function `fn_get_equipment_daily_rate(p_equipment_id)`.
     */
    public java.math.BigDecimal getEquipmentDailyRate(Long equipmentId) {
        String sql = "SELECT fn_get_equipment_daily_rate(?)";
        try {
            java.math.BigDecimal rate = jdbcTemplate.queryForObject(sql, java.math.BigDecimal.class, equipmentId);
            return rate != null ? rate : java.math.BigDecimal.ZERO;
        } catch (Exception e) {
            try {
                java.math.BigDecimal fallback = jdbcTemplate.queryForObject(
                        "SELECT daily_rate FROM equipment WHERE equipment_id = ?",
                        java.math.BigDecimal.class, equipmentId);
                return fallback != null ? fallback : java.math.BigDecimal.ZERO;
            } catch (Exception ex) {
                return java.math.BigDecimal.ZERO;
            }
        }
    }

    public int updatePrimaryImageUrl(Long equipmentId, String primaryImageUrl) {
        String sql = "UPDATE equipment SET primary_image_url = ? WHERE equipment_id = ?";
        return jdbcTemplate.update(sql, primaryImageUrl, equipmentId);
    }

    public Long saveEquipmentImage(Long equipmentId, String imageUrl, boolean isPrimary, int displayOrder) {
        String sql = """
            INSERT INTO equipment_images (equipment_id, image_url, is_primary, display_order, created_at)
            VALUES (?, ?, ?, ?, NOW())
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, equipmentId);
            ps.setString(2, imageUrl.trim());
            ps.setBoolean(3, isPrimary);
            ps.setInt(4, displayOrder);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        return key != null ? key.longValue() : null;
    }

    public List<EquipmentImageDto> findImagesByEquipmentId(Long equipmentId) {
        String sql = """
            SELECT image_id, equipment_id, image_url, is_primary, display_order, created_at
            FROM equipment_images
            WHERE equipment_id = ?
            ORDER BY is_primary DESC, display_order ASC, image_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Timestamp ts = rs.getTimestamp("created_at");
            return new EquipmentImageDto(
                    rs.getLong("image_id"),
                    rs.getLong("equipment_id"),
                    rs.getString("image_url"),
                    rs.getBoolean("is_primary"),
                    rs.getInt("display_order"),
                    ts != null ? ts.toLocalDateTime() : null
            );
        }, equipmentId);
    }

    public Optional<EquipmentImageDto> findImageById(Long imageId) {
        String sql = """
            SELECT image_id, equipment_id, image_url, is_primary, display_order, created_at
            FROM equipment_images
            WHERE image_id = ?
            """;
        try {
            EquipmentImageDto img = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Timestamp ts = rs.getTimestamp("created_at");
                return new EquipmentImageDto(
                    rs.getLong("image_id"),
                    rs.getLong("equipment_id"),
                    rs.getString("image_url"),
                    rs.getBoolean("is_primary"),
                    rs.getInt("display_order"),
                    ts != null ? ts.toLocalDateTime() : null
                );
            }, imageId);
            return Optional.ofNullable(img);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public int deleteEquipmentImage(Long imageId) {
        String sql = "DELETE FROM equipment_images WHERE image_id = ?";
        return jdbcTemplate.update(sql, imageId);
    }

    public void clearPrimaryImages(Long equipmentId) {
        String sql = "UPDATE equipment_images SET is_primary = 0 WHERE equipment_id = ?";
        jdbcTemplate.update(sql, equipmentId);
    }

    public void setPrimaryImage(Long equipmentId, Long imageId) {
        clearPrimaryImages(equipmentId);
        String sql = "UPDATE equipment_images SET is_primary = 1 WHERE image_id = ? AND equipment_id = ?";
        jdbcTemplate.update(sql, imageId, equipmentId);
    }

    public void deleteImagesByEquipmentId(Long equipmentId) {
        String sql = "DELETE FROM equipment_images WHERE equipment_id = ?";
        jdbcTemplate.update(sql, equipmentId);
    }
}
