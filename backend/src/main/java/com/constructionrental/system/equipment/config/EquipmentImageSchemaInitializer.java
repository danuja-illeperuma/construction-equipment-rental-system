package com.constructionrental.system.equipment.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(10)
public class EquipmentImageSchemaInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(EquipmentImageSchemaInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public EquipmentImageSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Checking equipment images schema definitions...");

            // 1. Ensure primary_image_url column exists on equipment table
            Integer columnExists = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'equipment' 
                  AND COLUMN_NAME = 'primary_image_url'
                """, Integer.class);

            if (columnExists == null || columnExists == 0) {
                log.info("Adding primary_image_url column to equipment table...");
                jdbcTemplate.execute("ALTER TABLE equipment ADD COLUMN primary_image_url VARCHAR(500) DEFAULT NULL");
                log.info("Column primary_image_url added successfully.");
            } else {
                log.info("Column primary_image_url already present on equipment table.");
            }

            // 2. Ensure equipment_images table exists
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS equipment_images (
                    image_id BIGINT NOT NULL AUTO_INCREMENT,
                    equipment_id BIGINT NOT NULL,
                    image_url VARCHAR(500) NOT NULL,
                    is_primary TINYINT(1) NOT NULL DEFAULT 0,
                    display_order INT NOT NULL DEFAULT 0,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (image_id),
                    KEY idx_equipment_images_equipment (equipment_id),
                    CONSTRAINT fk_equipment_images_equipment 
                        FOREIGN KEY (equipment_id) 
                        REFERENCES equipment (equipment_id) 
                        ON DELETE CASCADE 
                        ON UPDATE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                """);
            log.info("Equipment images table verification complete.");

        } catch (Exception ex) {
            log.warn("Equipment image schema initialization check encountered: {}", ex.getMessage());
        }
    }
}
