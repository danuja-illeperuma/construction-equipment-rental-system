-- ============================================================================
-- CONSTRUCTION EQUIPMENT RENTAL & MANAGEMENT SYSTEM (CERMS)
-- Latest Production Database Schema (MySQL 8.4)
-- Exported: October 2026
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `construction_rental` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `construction_rental`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Table structure for `audit_logs`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `audit_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `action` varchar(50) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` bigint DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_created_at` (`created_at`),
  KEY `idx_audit_table_action` (`table_name`,`action`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `customers`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `customer_id` bigint NOT NULL AUTO_INCREMENT,
  `customer_type` enum('INDIVIDUAL','CONTRACTOR','COMPANY') NOT NULL,
  `name` varchar(150) NOT NULL,
  `nic_or_br_number` varchar(30) DEFAULT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_customers_type_active` (`is_active`,`customer_type`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `damage_reports`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `damage_reports`;
CREATE TABLE `damage_reports` (
  `damage_id` bigint NOT NULL AUTO_INCREMENT,
  `return_id` bigint NOT NULL,
  `description` varchar(500) NOT NULL,
  `damage_charge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reported_by` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`damage_id`),
  KEY `fk_damage_return` (`return_id`),
  KEY `fk_damage_user` (`reported_by`),
  CONSTRAINT `fk_damage_return` FOREIGN KEY (`return_id`) REFERENCES `equipment_returns` (`return_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_damage_user` FOREIGN KEY (`reported_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_damage_charge` CHECK ((`damage_charge` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `equipment`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `equipment`;
CREATE TABLE `equipment` (
  `equipment_id` bigint NOT NULL AUTO_INCREMENT,
  `equipment_code` varchar(30) NOT NULL,
  `equipment_name` varchar(150) NOT NULL,
  `category_id` bigint NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `daily_rate` decimal(10,2) DEFAULT NULL,
  `monthly_rate` decimal(10,2) DEFAULT NULL,
  `status` enum('AVAILABLE','RENTED','MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
  `location` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `primary_image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`equipment_id`),
  UNIQUE KEY `equipment_code` (`equipment_code`),
  KEY `idx_equipment_category` (`category_id`),
  KEY `idx_equipment_status` (`status`),
  KEY `idx_equipment_active_status` (`is_active`,`status`),
  CONSTRAINT `fk_equipment_category` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_equipment_rates` CHECK ((((`hourly_rate` is null) or (`hourly_rate` >= 0)) and ((`daily_rate` is null) or (`daily_rate` >= 0)) and ((`monthly_rate` is null) or (`monthly_rate` >= 0))))
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `equipment_categories`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `equipment_categories`;
CREATE TABLE `equipment_categories` (
  `category_id` bigint NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `equipment_images`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `equipment_images`;
CREATE TABLE `equipment_images` (
  `image_id` bigint NOT NULL AUTO_INCREMENT,
  `equipment_id` bigint NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_equipment_images_equipment` (`equipment_id`),
  CONSTRAINT `fk_equipment_images_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `equipment_returns`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `equipment_returns`;
CREATE TABLE `equipment_returns` (
  `return_id` bigint NOT NULL AUTO_INCREMENT,
  `rental_item_id` bigint NOT NULL,
  `returned_at` datetime NOT NULL,
  `condition` enum('GOOD','DAMAGED') NOT NULL,
  `late_charge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `notes` varchar(500) DEFAULT NULL,
  `recorded_by` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`return_id`),
  UNIQUE KEY `rental_item_id` (`rental_item_id`),
  KEY `fk_return_user` (`recorded_by`),
  CONSTRAINT `fk_return_rental_item` FOREIGN KEY (`rental_item_id`) REFERENCES `rental_items` (`rental_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_return_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_late_charge` CHECK ((`late_charge` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `maintenance_records`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `maintenance_records`;
CREATE TABLE `maintenance_records` (
  `maintenance_id` bigint NOT NULL AUTO_INCREMENT,
  `equipment_id` bigint NOT NULL,
  `maintenance_type` enum('ROUTINE','REPAIR') NOT NULL,
  `description` varchar(500) NOT NULL,
  `maintenance_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `maintenance_date` date NOT NULL,
  `next_maintenance_date` date DEFAULT NULL,
  `status` enum('PENDING','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `notes` varchar(500) DEFAULT NULL,
  `recorded_by` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_id` bigint DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT '0',
  `paid_at` datetime DEFAULT NULL,
  PRIMARY KEY (`maintenance_id`),
  KEY `fk_maintenance_user` (`recorded_by`),
  KEY `idx_maintenance_equipment` (`equipment_id`),
  KEY `idx_maintenance_status` (`status`),
  KEY `idx_maint_equip_status_date` (`equipment_id`,`status`,`maintenance_date`),
  KEY `fk_maintenance_customer` (`customer_id`),
  CONSTRAINT `fk_maintenance_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_maintenance_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_maintenance_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_maintenance_cost` CHECK ((`maintenance_cost` >= 0)),
  CONSTRAINT `chk_maintenance_dates` CHECK (((`next_maintenance_date` is null) or (`next_maintenance_date` >= `maintenance_date`)))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `payments`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `rental_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('PAYHERE','SIMULATED') NOT NULL,
  `payment_status` enum('PENDING','SUCCESS','FAILED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `transaction_reference` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `rental_id` (`rental_id`),
  UNIQUE KEY `transaction_reference` (`transaction_reference`),
  KEY `idx_payments_status_created` (`payment_status`,`created_at`),
  CONSTRAINT `fk_payment_rental` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`rental_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_payment_amount` CHECK ((`amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `rental_items`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `rental_items`;
CREATE TABLE `rental_items` (
  `rental_item_id` bigint NOT NULL AUTO_INCREMENT,
  `rental_id` bigint NOT NULL,
  `equipment_id` bigint NOT NULL,
  `rental_type` enum('HOURLY','DAILY','MONTHLY') NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `duration` decimal(10,2) NOT NULL DEFAULT '1.00',
  `unit_rate` decimal(10,2) NOT NULL,
  `item_amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`rental_item_id`),
  UNIQUE KEY `uq_rental_equipment` (`rental_id`,`equipment_id`),
  KEY `idx_rental_items_equipment` (`equipment_id`),
  CONSTRAINT `fk_rental_item_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_rental_item_rental` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`rental_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_rental_item_amount` CHECK ((`item_amount` >= 0)),
  CONSTRAINT `chk_rental_item_quantity` CHECK ((`quantity` > 0)),
  CONSTRAINT `chk_rental_item_rate` CHECK ((`unit_rate` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `rentals`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `rentals`;
CREATE TABLE `rentals` (
  `rental_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_reference` varchar(30) NOT NULL,
  `customer_id` bigint NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('PENDING_PAYMENT','CONFIRMED','ACTIVE','COMPLETED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `payment_deadline` datetime DEFAULT NULL,
  `pickup_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rental_duration_days` int GENERATED ALWAYS AS ((to_days(`end_date`) - to_days(`start_date`))) STORED,
  PRIMARY KEY (`rental_id`),
  UNIQUE KEY `booking_reference` (`booking_reference`),
  KEY `idx_rentals_customer` (`customer_id`),
  KEY `idx_rentals_start_date` (`start_date`),
  KEY `idx_rentals_end_date` (`end_date`),
  KEY `idx_rentals_status` (`status`),
  KEY `idx_rentals_status_dates` (`status`,`start_date`,`end_date`),
  CONSTRAINT `fk_rental_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_rental_dates` CHECK ((`end_date` >= `start_date`)),
  CONSTRAINT `chk_rental_total` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------
-- Table structure for `users`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','MANAGER','STAFF') NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;