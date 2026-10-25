-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: construction-rental-db-ictdanu-4bd4.b.aivencloud.com    Database: construction_rental
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'b317dab8-bcdd-11f1-a7f7-6a0819fe9bb1:1-84';

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `damage_reports`
--

DROP TABLE IF EXISTS `damage_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `operator_available` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`equipment_id`),
  UNIQUE KEY `equipment_code` (`equipment_code`),
  KEY `idx_equipment_category` (`category_id`),
  KEY `idx_equipment_status` (`status`),
  CONSTRAINT `fk_equipment_category` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_equipment_rates` CHECK ((((`hourly_rate` is null) or (`hourly_rate` >= 0)) and ((`daily_rate` is null) or (`daily_rate` >= 0)) and ((`monthly_rate` is null) or (`monthly_rate` >= 0))))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipment_categories`
--

DROP TABLE IF EXISTS `equipment_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment_categories` (
  `category_id` bigint NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipment_returns`
--

DROP TABLE IF EXISTS `equipment_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maintenance_records`
--

DROP TABLE IF EXISTS `maintenance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`maintenance_id`),
  KEY `fk_maintenance_user` (`recorded_by`),
  KEY `idx_maintenance_equipment` (`equipment_id`),
  KEY `idx_maintenance_status` (`status`),
  CONSTRAINT `fk_maintenance_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_maintenance_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_maintenance_cost` CHECK ((`maintenance_cost` >= 0)),
  CONSTRAINT `chk_maintenance_dates` CHECK (((`next_maintenance_date` is null) or (`next_maintenance_date` >= `maintenance_date`)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `fk_payment_rental` FOREIGN KEY (`rental_id`) REFERENCES `rentals` (`rental_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_payment_amount` CHECK ((`amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rental_items`
--

DROP TABLE IF EXISTS `rental_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rentals`
--

DROP TABLE IF EXISTS `rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  PRIMARY KEY (`rental_id`),
  UNIQUE KEY `booking_reference` (`booking_reference`),
  KEY `idx_rentals_customer` (`customer_id`),
  KEY `idx_rentals_start_date` (`start_date`),
  KEY `idx_rentals_end_date` (`end_date`),
  KEY `idx_rentals_status` (`status`),
  CONSTRAINT `fk_rental_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_rental_dates` CHECK ((`end_date` >= `start_date`)),
  CONSTRAINT `chk_rental_total` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-01 18:06:38
