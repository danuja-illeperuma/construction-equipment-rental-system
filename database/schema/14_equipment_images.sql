-- ============================================================
-- CERMS Database Migration: Equipment Images Support
-- Adds primary_image_url to equipment and creates equipment_images table
-- ============================================================

-- 1. Add primary_image_url column to equipment table if not exists
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'equipment' 
      AND COLUMN_NAME = 'primary_image_url'
);

SET @stmt = IF(@col_exists = 0, 
    'ALTER TABLE equipment ADD COLUMN primary_image_url VARCHAR(500) DEFAULT NULL AFTER location', 
    'SELECT "Column primary_image_url already exists"'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Create equipment_images child table for multiple gallery photos
CREATE TABLE IF NOT EXISTS `equipment_images` (
    `image_id` BIGINT NOT NULL AUTO_INCREMENT,
    `equipment_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`image_id`),
    KEY `idx_equipment_images_equipment` (`equipment_id`),
    CONSTRAINT `fk_equipment_images_equipment` 
        FOREIGN KEY (`equipment_id`) 
        REFERENCES `equipment` (`equipment_id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
