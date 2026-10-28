# 🏗️ Construction Equipment Rental & Management System (CERMS)
### Enterprise Multi-Tier Heavy Plant Rental, Fleet Logistics & Relational Database Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21%20LTS-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.4%20Enterprise-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, full-stack multi-tier web application engineered for commercial heavy machinery hire, fleet logistics, automated availability scheduling, damage inspection, PayHere payment gateway settlement, and routine maintenance lifecycle management.

---

## 📑 Table of Contents
1. [System Architecture & Overview](#1-system-architecture--overview)
2. [Technology Stack](#2-technology-stack)
3. [User Roles & Functional Portals](#3-user-roles--functional-portals)
4. [Master 5-Member Workload & Object Matrix](#4-master-5-member-workload--object-matrix)
5. [Authoritative Member-by-Member Database Objects](#5-authoritative-member-by-member-database-objects)
   - [Member 1: User & Customer Management](#section-1-member-1---user--customer-management)
   - [Member 2: Equipment Fleet & Category Management](#section-2-member-2---equipment-fleet--category-management)
   - [Member 3: Rental & Availability](#section-3-member-3---rental--availability)
   - [Member 4: Payments, Returns & Damage Inspection](#section-4-member-4---payments-returns--damage-inspection)
   - [Member 5: Maintenance Management, Reports & Audit Logs](#section-5-member-5---maintenance-management-reports--audit-logs)
6. [Core Database Transaction: Payment Settlement (ACID Defense)](#6-core-database-transaction-payment-settlement-acid-defense)
7. [Unique MySQL 8 Feature: Stored Generated Column](#7-unique-mysql-8-feature-stored-generated-column)
8. [Enforced Business Rules & Safeguards](#8-enforced-business-rules--safeguards)
9. [REST API Endpoint Catalog](#9-rest-api-endpoint-catalog)
10. [Step-by-Step Installation & Setup](#10-step-by-step-installation--setup)
11. [Environment Variable Configuration](#11-environment-variable-configuration)
12. [Project Directory Structure](#12-project-directory-structure)
13. [Academic Defense & Viva Examination Cheatsheet](#13-academic-defense--viva-examination-cheatsheet)
14. [License & Acknowledgments](#14-license--acknowledgments)

---

## 1. System Architecture & Overview

**CERMS** bridges heavy machinery plant hire companies, field contractors, and depot operations into a unified real-time management platform. Built with a high-performance **Spring Boot 3 (Java 21)** REST API backend using **Spring JDBC (`JdbcTemplate`)** and a responsive **React 18 + Vite** frontend styled with **Tailwind CSS**.

The database architecture is powered by **MySQL 8.4 Enterprise** (hosted on Aiven Cloud), strictly enforcing automated database-level integrity through stored procedures, scalar user-defined functions, triggers, scheduled events, composite indexes, and atomic ACID transactions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 18 + Vite Frontend                        │
│             (Tailwind CSS, React Router, Recharts, Lucide)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST API / JWT
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Spring Boot 3.3.4 (Java 21)                      │
│   ├── Security & JWT Filter (Stateless RBAC)                           │
│   ├── REST Controllers (/api/v1/...)                                   │
│   ├── Business Services (Validation & Domain Rules)                    │
│   └── Spring JDBC Repositories (JdbcTemplate / SimpleJdbcCall)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HikariCP Connection Pool
┌───────────────────────────────────▼────────────────────────────────────┐
│                    MySQL 8.4 Enterprise Database                       │
│   ├── 5 Relational Domain Modules (Customers, Fleet, Rentals, etc.)    │
│   ├── 5 Views | 5 Functions | 7 Procedures | 5 Triggers                │
│   ├── 5 Composite Indexes | 5 Scheduled Background Events              │
│   └── Multi-Table ACID Transactions & Stored Generated Columns         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3.1, Vite 5.4.8 | High-performance SPA with fast module replacement |
| **Styling & Icons** | Tailwind CSS 3.4.13, Lucide React 0.446 | Responsive enterprise design system |
| **Data Visualization** | Recharts 3.10.1 | Operational KPIs, fleet metrics, and financial charts |
| **Backend Framework** | Spring Boot 3.3.4 (Java 21 LTS) | Modern RESTful micro-service architecture |
| **Data Access** | Spring JDBC (`JdbcTemplate`, `SimpleJdbcCall`) | Direct SQL execution without ORM bloat |
| **Connection Pool** | HikariCP | Low-latency production database pooling |
| **Security & Auth** | Spring Security 6, JJWT 0.12.6, BCrypt | Stateless JWT Bearer token authentication & RBAC |
| **Database** | MySQL 8.4 Enterprise (Aiven Cloud / Local) | High-availability relational database engine |
| **Payment Gateway** | PayHere Payment Gateway SDK | Secure sandbox & live merchant payment settlement |
| **Cloud Storage** | Cloudinary API | Cloud object storage for heavy machinery photography |
| **Build Tools** | Apache Maven 3.9+, Node.js 20+, npm | Build, packaging, and dependency management |

---

## 3. User Roles & Functional Portals

```
┌───────────────────────────────────────────────────────────────────────┐
│                      ROLE-BASED ACCESS CONTROL                        │
├───────────────────┬───────────────────┬───────────────────────────────┤
│    CUSTOMER       │      STAFF        │            ADMIN              │
├───────────────────┼───────────────────┼───────────────────────────────┤
│ • Fleet Browsing  │ • Machine Handover│ • Full Machinery CRUD         │
│ • Online Booking  │ • Return Inspec.  │ • User Account Administration │
│ • PayHere Payment │ • Damage Logging  │ • Financial Reports & Ledger  │
│ • Rental History  │ • Service Sched.  │ • System Telemetry & Audits   │
│ • Damage Tracking │ • Workshop Ops.   │ • Security & Role Management  │
└───────────────────┴───────────────────┴───────────────────────────────┘
```

---

## 4. Master 5-Member Workload & Object Matrix

Strictly adhering to academic syllabus distribution (ICT3222 Advanced Database Systems), each team member is assigned exclusive ownership of one functional module with an identical quota of relational database objects:

| Member | Functional Domain & Tables | View | Scalar Function | Stored Procedure | Database Trigger | Composite Index | Scheduled Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **User & Customer**<br>`customers`, `users`, `audit_logs` | `view_active_customers` | `fn_customer_booking_count` | `sp_toggle_customer_active` | `trg_validate_customer_email` | `idx_customers_type_active` | `evt_daily_customer_count_log` |
| **Member 2** | **Equipment Fleet**<br>`equipment`, `equipment_categories` | `view_available_equipment` | `fn_get_equipment_daily_rate` | `sp_update_equipment_status` | `trg_validate_equipment_rates` | `idx_equipment_active_status` | `evt_daily_maintenance_status_check` |
| **Member 3** | **Rental & Booking**<br>`rentals`, `rental_items` | `view_active_rentals` | `calculate_rental_amount` | `sp_cancel_rental` | `trg_rental_items_before_insert` | `idx_rentals_status_dates` | `evt_hourly_expire_pending_rentals` |
| **Member 4** | **Payment & Returns**<br>`payments`, `equipment_returns`, `damage_reports` | `view_successful_payments` | `calculate_late_charge` | `sp_process_return`<br>`sp_process_payment_transaction` | `trg_payments_after_update` | `idx_payments_status_created` | `evt_daily_revenue_log` |
| **Member 5** | **Maintenance & Reports**<br>`maintenance_records`, `audit_logs` | `v_equipment_maintenance_summary` | `calculate_equipment_maintenance_cost` | `sp_complete_maintenance` | `trg_maintenance_records_before_insert` | `idx_maint_equip_status_date` | `evt_weekly_maintenance_summary` |

---

## 5. Authoritative Member-by-Member Database Objects
*(Exact verbatim definitions from `database/all_5_members_database_objects.sql`)*

---

### SECTION 1: MEMBER 1 - USER & CUSTOMER MANAGEMENT
- **SQL Script:** `database/member1_user_customer.sql`
- **Domain Tables:** `customers`, `users`, `audit_logs`

#### 1. View: `view_active_customers`
```sql
CREATE VIEW view_active_customers AS
SELECT 
    customer_id,
    customer_type,
    name,
    nic_or_br_number,
    phone,
    email,
    address,
    created_at
FROM customers
WHERE is_active = 1;
```
- **Backend Caller:** `CustomerRepository.java` (`findAllActive()`) mapped to `GET /api/v1/customers`.
- **Frontend Effect:** Populates the active client ledger in `UsersList.jsx` and the client selector in `RentalBooking.jsx`.

#### 2. Scalar Function: `fn_customer_booking_count`
```sql
DELIMITER $$
CREATE FUNCTION fn_customer_booking_count(p_customer_id BIGINT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_count INT DEFAULT 0;
    SELECT COUNT(*) INTO v_count
    FROM rentals
    WHERE customer_id = p_customer_id
      AND status NOT IN ('CANCELLED', 'EXPIRED');
    RETURN v_count;
END $$
DELIMITER ;
```
- **Backend Caller:** `CustomerRepository.java` via `SELECT fn_customer_booking_count(?)`.
- **Frontend Effect:** Displays the "Total Bookings" metric badge on the client profile card in `CustomerProfile.jsx`.

#### 3. Stored Procedure: `sp_toggle_customer_active`
```sql
DELIMITER $$
CREATE PROCEDURE sp_toggle_customer_active(
    IN  p_customer_id BIGINT,
    IN  p_is_active   BOOLEAN,
    OUT p_success     BOOLEAN,
    OUT p_message     VARCHAR(255)
)
BEGIN
    DECLARE v_active_rentals INT DEFAULT 0;
    IF p_is_active = FALSE THEN
        SELECT COUNT(*) INTO v_active_rentals
        FROM rentals
        WHERE customer_id = p_customer_id
          AND status IN ('CONFIRMED', 'ACTIVE');
        IF v_active_rentals > 0 THEN
            SET p_success = FALSE;
            SET p_message = 'Cannot deactivate customer with ongoing active rentals';
        ELSE
            UPDATE customers SET is_active = p_is_active WHERE customer_id = p_customer_id;
            SET p_success = TRUE;
            SET p_message = 'Customer deactivated successfully';
        END IF;
    ELSE
        UPDATE customers SET is_active = p_is_active WHERE customer_id = p_customer_id;
        SET p_success = TRUE;
        SET p_message = 'Customer activated successfully';
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** `CustomerRepository.java` on `PATCH /api/v1/customers/{id}/status`.
- **Frontend Effect:** Triggered when the administrator flips the activation switch in `UsersList.jsx`. If a customer currently has machines on-site, deactivation is safely rejected.

#### 4. Database Trigger: `trg_validate_customer_email`
```sql
DELIMITER $$
CREATE TRIGGER trg_validate_customer_email
BEFORE INSERT ON customers
FOR EACH ROW
BEGIN
    IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer name cannot be empty';
    END IF;
    IF NEW.phone IS NULL OR TRIM(NEW.phone) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer phone cannot be empty';
    END IF;
    IF NEW.email NOT LIKE '%@%.%' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email address format';
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** Fires automatically during `CustomerRepository.save()` on `POST /api/v1/auth/register`.
- **Frontend Effect:** Protects user registration in `Register.jsx` from blank names, blank phones, and corrupt email addresses.

#### 5. Custom Composite Index: `idx_customers_type_active`
```sql
CREATE INDEX idx_customers_type_active ON customers (is_active, customer_type);
```
- **Leftmost Prefix Rationale:** Customer lookup queries always filter first by `is_active = 1` and second by `customer_type = 'INDIVIDUAL' | 'COMPANY' | 'CONTRACTOR'`.
- **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT customer_id, name, email FROM customers WHERE is_active = 1 AND customer_type = 'CONTRACTOR';
  ```

#### 6. Scheduled Event: `evt_daily_customer_count_log`
```sql
DELIMITER $$
CREATE EVENT evt_daily_customer_count_log
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 1 DAY)
DO
BEGIN
    DECLARE v_active_count INT;
    DECLARE v_admin_id BIGINT;
    SELECT user_id INTO v_admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    SELECT COUNT(*) INTO v_active_count FROM customers WHERE is_active = 1;
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, description, created_at)
        VALUES (v_admin_id, 'DAILY_AUDIT', 'customers', 0, CONCAT('Active customers count: ', v_active_count), NOW());
    END IF;
END $$
DELIMITER ;
```
- **Frontend Effect:** Populates the system telemetry timeline in `AuditLogs.jsx`.

---

### SECTION 2: MEMBER 2 - EQUIPMENT FLEET & CATEGORY MANAGEMENT
- **SQL Script:** `database/member2_equipment_fleet.sql`
- **Domain Tables:** `equipment`, `equipment_categories`

#### 1. View: `view_available_equipment`
```sql
CREATE VIEW view_available_equipment AS
SELECT 
    e.equipment_id,
    e.equipment_code,
    e.equipment_name,
    c.category_name,
    e.daily_rate,
    e.hourly_rate,
    e.monthly_rate,
    e.status
FROM equipment e
JOIN equipment_categories c ON e.category_id = c.category_id
WHERE e.is_active = 1 
  AND e.status = 'AVAILABLE';
```
- **Backend Caller:** `EquipmentRepository.java` (`findAvailableCatalog()`) on `GET /api/v1/equipment/catalog`.
- **Frontend Effect:** Renders available machinery cards on `EquipmentCatalog.jsx` and the client portal. Machines under maintenance or currently on hire are automatically excluded.

#### 2. Scalar Function: `fn_get_equipment_daily_rate`
```sql
DELIMITER $$
CREATE FUNCTION fn_get_equipment_daily_rate(p_equipment_id BIGINT)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_daily_rate DECIMAL(10,2) DEFAULT 0.00;
    SELECT daily_rate INTO v_daily_rate
    FROM equipment
    WHERE equipment_id = p_equipment_id;
    RETURN v_daily_rate;
END $$
DELIMITER ;
```
- **Backend Caller:** `EquipmentRepository.java` via `SELECT fn_get_equipment_daily_rate(?)`.
- **Frontend Effect:** Powers dynamic daily hire rate estimation on `EquipmentDetail.jsx` and `QuotationPage.jsx`.

#### 3. Stored Procedure: `sp_update_equipment_status`
```sql
DELIMITER $$
CREATE PROCEDURE sp_update_equipment_status(
    IN  p_equipment_id BIGINT,
    IN  p_new_status   VARCHAR(20),
    OUT p_success      BOOLEAN
)
BEGIN
    IF p_new_status NOT IN ('AVAILABLE', 'RENTED', 'MAINTENANCE') THEN
        SET p_success = FALSE;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid status. Allowed: AVAILABLE, RENTED, MAINTENANCE';
    ELSE
        UPDATE equipment 
        SET status = p_new_status 
        WHERE equipment_id = p_equipment_id;
        SET p_success = TRUE;
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** `EquipmentRepository.java` on `PATCH /api/v1/equipment/{id}/status`.
- **Frontend Effect:** Updates inventory availability badges immediately across `EquipmentManagement.jsx`.

#### 4. Database Trigger: `trg_validate_equipment_rates`
```sql
DELIMITER $$
CREATE TRIGGER trg_validate_equipment_rates
BEFORE INSERT ON equipment
FOR EACH ROW
BEGIN
    IF NEW.daily_rate < 0 OR NEW.hourly_rate < 0 OR NEW.monthly_rate < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Equipment rates cannot be negative';
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** Automatically fires during `EquipmentRepository.save()` on `POST /api/v1/equipment`.
- **Frontend Effect:** Protects the "Add Machine" modal in `EquipmentManagement.jsx` against negative pricing.

#### 5. Custom Composite Index: `idx_equipment_active_status`
```sql
CREATE INDEX idx_equipment_active_status ON equipment (is_active, status);
```
- **Leftmost Prefix Rationale:** Optimizes the public catalog filtering `WHERE is_active = 1 AND status = 'AVAILABLE'`.
- **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT equipment_id, equipment_name, daily_rate FROM equipment WHERE is_active = 1 AND status = 'AVAILABLE';
  ```

#### 6. Scheduled Event: `evt_daily_maintenance_status_check`
```sql
DELIMITER $$
CREATE EVENT evt_daily_maintenance_status_check
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 2 HOUR)
DO
BEGIN
    UPDATE equipment e
    JOIN maintenance_records m ON e.equipment_id = m.equipment_id
    SET e.status = 'MAINTENANCE'
    WHERE m.status = 'PENDING'
      AND m.maintenance_date <= CURDATE()
      AND e.status != 'MAINTENANCE';
END $$
DELIMITER ;
```
- **Frontend Effect:** Automatically transitions machines with maintenance due today to `MAINTENANCE`, preventing customers from booking them.

---

### SECTION 3: MEMBER 3 - RENTAL & AVAILABILITY
- **SQL Script:** `database/member3_rental_booking.sql`
- **Domain Tables:** `rentals`, `rental_items`

#### 1. View: `view_active_rentals`
```sql
CREATE VIEW view_active_rentals AS
SELECT 
    r.rental_id,
    r.booking_reference,
    c.name AS customer_name,
    c.phone AS customer_phone,
    r.start_date,
    r.end_date,
    r.total_amount,
    r.status
FROM rentals r
JOIN customers c ON r.customer_id = c.customer_id
WHERE r.status IN ('CONFIRMED', 'ACTIVE');
```
- **Backend Caller:** `RentalRepository.java` (`findActiveRentals()`) on `GET /api/v1/rentals/active`.
- **Frontend Effect:** Powers the "Active on Site" board in `RentalsManagement.jsx` and the fleet operations dashboard.

#### 2. Scalar Function: `calculate_rental_amount`
```sql
DELIMITER $$
CREATE FUNCTION calculate_rental_amount(
    p_quantity  INT,
    p_duration  DECIMAL(10,2),
    p_unit_rate DECIMAL(10,2)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
NO SQL
BEGIN
    IF p_quantity <= 0 OR p_duration <= 0 OR p_unit_rate < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid rental calculation parameters';
    END IF;

    RETURN ROUND(p_quantity * p_duration * p_unit_rate, 2);
END $$
DELIMITER ;
```
- **Backend Caller:** `RentalItemRepository.java` (`callCalculateRentalAmount()`).
- **Frontend Effect:** Computes accurate line-item rental charges on `QuotationPage.jsx` and `RentalBooking.jsx`.

#### 3. Stored Procedure: `sp_cancel_rental`
```sql
DELIMITER $$
CREATE PROCEDURE sp_cancel_rental(IN p_rental_id BIGINT)
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT status INTO v_status FROM rentals WHERE rental_id = p_rental_id;

    IF v_status NOT IN ('PENDING_PAYMENT', 'CONFIRMED') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only PENDING_PAYMENT or CONFIRMED rentals can be cancelled';
    ELSE
        UPDATE rentals SET status = 'CANCELLED' WHERE rental_id = p_rental_id;
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** `RentalRepository.java` on `POST /api/v1/rentals/{id}/cancel`.
- **Frontend Effect:** Triggered when customers click "Cancel Rental Booking" on `MyRentals.jsx`. Prevents accidental cancellation of already dispatched machinery.

#### 4. Database Trigger: `trg_rental_items_before_insert`
```sql
DELIMITER $$
CREATE TRIGGER trg_rental_items_before_insert
BEFORE INSERT ON rental_items
FOR EACH ROW
BEGIN
    IF NEW.quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quantity must be greater than zero';
    END IF;
    IF NEW.duration <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duration must be greater than zero';
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** Fires automatically during `RentalItemRepository.save()` on `POST /api/v1/rentals`.
- **Frontend Effect:** Prevents corrupted or negative line-item bookings.

#### 5. Custom Composite Index: `idx_rentals_status_dates`
```sql
CREATE INDEX idx_rentals_status_dates ON rentals (status, start_date, end_date);
```
- **Leftmost Prefix Rationale:** The conflict detection engine checks non-terminal statuses (`PENDING_PAYMENT`, `CONFIRMED`, `ACTIVE`) across overlapping rental date windows.
- **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT rental_id, booking_reference FROM rentals 
  WHERE status = 'ACTIVE' AND start_date <= '2026-11-05' AND end_date >= '2026-11-01';
  ```

#### 6. Scheduled Event: `evt_hourly_expire_pending_rentals`
```sql
DELIMITER $$
CREATE EVENT evt_hourly_expire_pending_rentals
ON SCHEDULE EVERY 15 MINUTE
DO
BEGIN
    UPDATE rentals
    SET status = 'EXPIRED'
    WHERE status = 'PENDING_PAYMENT'
      AND NOW() > payment_deadline;
END $$
DELIMITER ;
```
- **Frontend Effect:** Pending bookings not settled within the 15-minute window automatically transition to `EXPIRED`, releasing locked fleet machinery back to available inventory.

---

### SECTION 4: MEMBER 4 - PAYMENTS, RETURNS & DAMAGE INSPECTION
- **SQL Script:** `database/member4_payment_returns.sql`
- **Domain Tables:** `payments`, `equipment_returns`, `damage_reports`

#### 1. View: `view_successful_payments`
```sql
CREATE VIEW view_successful_payments AS
SELECT 
    p.payment_id,
    p.transaction_reference,
    r.booking_reference,
    c.name AS customer_name,
    p.amount,
    p.payment_method,
    p.paid_at
FROM payments p
JOIN rentals r ON p.rental_id = r.rental_id
JOIN customers c ON r.customer_id = c.customer_id
WHERE p.payment_status = 'SUCCESS';
```
- **Backend Caller:** `PaymentRepository.java` on `GET /api/v1/payments/successful`.
- **Frontend Effect:** Populates the completed revenue transaction table on `PaymentsList.jsx`.

#### 2. Scalar Function: `calculate_late_charge`
```sql
DELIMITER $$
CREATE FUNCTION calculate_late_charge(
    p_rental_item_id BIGINT,
    p_returned_at    DATETIME
)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_end_date DATE;
    DECLARE v_unit_rate DECIMAL(10,2);
    DECLARE v_days_late INT DEFAULT 0;
    
    SELECT r.end_date, ri.unit_rate
    INTO v_end_date, v_unit_rate
    FROM rental_items ri
    JOIN rentals r ON ri.rental_id = r.rental_id
    WHERE ri.rental_item_id = p_rental_item_id;
    
    IF DATE(p_returned_at) > v_end_date THEN
        SET v_days_late = DATEDIFF(DATE(p_returned_at), v_end_date);
        RETURN ROUND(v_days_late * v_unit_rate * 1.5, 2);
    ELSE
        RETURN 0.00;
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** `ReturnRepository.java` (`callCalculateLateCharge()`).
- **Frontend Effect:** Displays the calculated late fee on `ReturnProcessing.jsx` when yard technicians inspect returned equipment.

#### 3. Stored Procedure: `sp_process_return`
```sql
DELIMITER $$
CREATE PROCEDURE sp_process_return(
    IN  p_rental_item_id BIGINT,
    IN  p_returned_at    DATETIME,
    IN  p_condition      VARCHAR(20),
    IN  p_notes          VARCHAR(500),
    IN  p_recorded_by    BIGINT,
    OUT p_return_id      BIGINT,
    OUT p_late_charge    DECIMAL(10,2)
)
BEGIN
    DECLARE v_equipment_id BIGINT;
    DECLARE v_rental_id BIGINT;
    DECLARE v_unreturned_count INT DEFAULT 0;
    
    SELECT equipment_id, rental_id INTO v_equipment_id, v_rental_id 
    FROM rental_items WHERE rental_item_id = p_rental_item_id;
    
    SET p_late_charge = calculate_late_charge(p_rental_item_id, p_returned_at);
    
    INSERT INTO equipment_returns (rental_item_id, returned_at, `condition`, late_charge, notes, recorded_by, created_at)
    VALUES (p_rental_item_id, p_returned_at, p_condition, p_late_charge, p_notes, p_recorded_by, NOW());
    
    SET p_return_id = LAST_INSERT_ID();
    
    IF p_condition = 'DAMAGED' THEN
        UPDATE equipment SET status = 'MAINTENANCE' WHERE equipment_id = v_equipment_id;
    ELSE
        UPDATE equipment SET status = 'AVAILABLE' WHERE equipment_id = v_equipment_id;
    END IF;

    -- Check if all items for this rental have now been returned
    SELECT COUNT(*) INTO v_unreturned_count
    FROM rental_items ri
    LEFT JOIN equipment_returns er ON ri.rental_item_id = er.rental_item_id
    WHERE ri.rental_id = v_rental_id
      AND er.return_id IS NULL;

    -- Automatically transition rental lifecycle to COMPLETED
    IF v_unreturned_count = 0 THEN
        UPDATE rentals
        SET status = 'COMPLETED'
        WHERE rental_id = v_rental_id;
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** `ReturnRepository.java` on `POST /api/v1/returns`.
- **Frontend Effect:** Automatically advances the booking from "Active on Site" to "COMPLETED" in `ReturnProcessing.jsx` when all items are returned.

#### 4. Stored Procedure / Native ACID Transaction: `sp_process_payment_transaction`
```sql
DELIMITER $$
CREATE PROCEDURE sp_process_payment_transaction(
    IN p_payment_id            BIGINT,
    IN p_payment_status        VARCHAR(20),
    IN p_transaction_reference VARCHAR(100)
)
BEGIN
    -- Declarative Error Handler: Automatically rolls back on ANY database error
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    -- 1. START NATIVE MYSQL TRANSACTION
    START TRANSACTION;

    -- 2. Update payment status
    UPDATE payments 
    SET payment_status = p_payment_status,
        transaction_reference = p_transaction_reference,
        paid_at = CASE WHEN p_payment_status = 'SUCCESS' THEN NOW() ELSE paid_at END
    WHERE payment_id = p_payment_id;

    -- 3. Update rental booking status if payment succeeded
    IF p_payment_status = 'SUCCESS' THEN
        UPDATE rentals r
        JOIN payments p ON r.rental_id = p.rental_id
        SET r.status = 'CONFIRMED'
        WHERE p.payment_id = p_payment_id
          AND r.status = 'PENDING_PAYMENT';
    END IF;

    -- 4. COMMIT NATIVE MYSQL TRANSACTION
    COMMIT;
END $$
DELIMITER ;
```
- **Backend Caller:** `PaymentRepository.java` (`callProcessPayment()`) on `POST /api/v1/payments`.
- **Frontend Effect:** Atomically updates the payment ledger and switches the rental booking to `CONFIRMED`.

#### 5. Database Trigger: `trg_payments_after_update`
```sql
DELIMITER $$
CREATE TRIGGER trg_payments_after_update
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.payment_status = 'SUCCESS' AND OLD.payment_status != 'SUCCESS' THEN
        UPDATE rentals
        SET status = 'CONFIRMED'
        WHERE rental_id = NEW.rental_id
          AND status = 'PENDING_PAYMENT';
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** Fires automatically when PayHere confirms payment settlement.
- **Frontend Effect:** Changes booking status immediately to "CONFIRMED".

#### 6. Custom Composite Index: `idx_payments_status_created`
```sql
CREATE INDEX idx_payments_status_created ON payments (payment_status, created_at);
```
- **Leftmost Prefix Rationale:** Optimizes financial ledger queries filtering by `payment_status = 'SUCCESS'` ordered chronologically.
- **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT payment_id, amount, paid_at FROM payments 
  WHERE payment_status = 'SUCCESS' ORDER BY created_at DESC;
  ```

#### 7. Scheduled Event: `evt_daily_revenue_log`
```sql
DELIMITER $$
CREATE EVENT evt_daily_revenue_log
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 23 HOUR + INTERVAL 59 MINUTE)
DO
BEGIN
    DECLARE v_daily_total DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_admin_id BIGINT;
    SELECT user_id INTO v_admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    
    SELECT COALESCE(SUM(amount), 0.00) INTO v_daily_total
    FROM payments
    WHERE payment_status = 'SUCCESS'
      AND DATE(paid_at) = CURDATE();
      
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, description, created_at)
        VALUES (v_admin_id, 'REVENUE_AUDIT', 'payments', 0, CONCAT('Daily revenue: LKR ', v_daily_total), NOW());
    END IF;
END $$
DELIMITER ;
```
- **Frontend Effect:** Records an immutable daily financial revenue snapshot in `AuditLogs.jsx`.

---

### SECTION 5: MEMBER 5 - MAINTENANCE MANAGEMENT, REPORTS & AUDIT LOGS
- **SQL Script:** `database/member5_maintenance_reports.sql`
- **Domain Tables:** `maintenance_records`, `audit_logs`

#### 1. View: `v_equipment_maintenance_summary`
```sql
CREATE VIEW v_equipment_maintenance_summary AS
SELECT 
    e.equipment_id,
    e.equipment_code,
    e.equipment_name,
    c.category_name,
    e.status AS equipment_status,
    COUNT(m.maintenance_id) AS total_jobs,
    COALESCE(SUM(m.maintenance_cost), 0.00) AS total_maintenance_cost,
    MAX(m.maintenance_date) AS last_service_date
FROM equipment e
JOIN equipment_categories c ON e.category_id = c.category_id
LEFT JOIN maintenance_records m ON e.equipment_id = m.equipment_id
GROUP BY e.equipment_id, e.equipment_code, e.equipment_name, c.category_name, e.status;
```
- **Backend Caller:** `MaintenanceRepository.java` on `GET /api/v1/maintenance/summary`.
- **Frontend Effect:** Populates maintenance metric cards and fleet service summaries in `MaintenanceList.jsx`.

#### 2. Scalar Function: `calculate_equipment_maintenance_cost`
```sql
DELIMITER $$
CREATE FUNCTION calculate_equipment_maintenance_cost(
    p_equipment_id BIGINT,
    p_start_date   DATE,
    p_end_date     DATE
)
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;
    SELECT COALESCE(SUM(maintenance_cost), 0.00) INTO v_total
    FROM maintenance_records
    WHERE equipment_id = p_equipment_id
      AND (p_start_date IS NULL OR maintenance_date >= p_start_date)
      AND (p_end_date IS NULL OR maintenance_date <= p_end_date);
    RETURN v_total;
END $$
DELIMITER ;
```
- **Backend Caller:** `ReportRepository.java` on `GET /api/v1/reports/maintenance/{equipmentId}/cost`.
- **Frontend Effect:** Displays total lifecycle repair costs on `EquipmentDetail.jsx` and financial report analytics.

#### 3. Stored Procedure: `sp_complete_maintenance`
```sql
DELIMITER $$
CREATE PROCEDURE sp_complete_maintenance(
    IN  p_maintenance_id BIGINT,
    IN  p_actual_cost    DECIMAL(10,2),
    OUT p_success        BOOLEAN
)
BEGIN
    DECLARE v_equipment_id BIGINT;
    
    SELECT equipment_id INTO v_equipment_id 
    FROM maintenance_records 
    WHERE maintenance_id = p_maintenance_id;
    
    UPDATE maintenance_records
    SET status = 'COMPLETED',
        maintenance_cost = p_actual_cost
    WHERE maintenance_id = p_maintenance_id;
    
    UPDATE equipment
    SET status = 'AVAILABLE'
    WHERE equipment_id = v_equipment_id;
    
    SET p_success = TRUE;
END $$
DELIMITER ;
```
- **Backend Caller:** `MaintenanceRepository.java` on `PATCH /api/v1/maintenance/{id}/complete`.
- **Frontend Effect:** Concludes repair orders, records actual maintenance expenditure, and immediately restores machinery to `AVAILABLE` inventory.

#### 4. Database Trigger: `trg_maintenance_records_before_insert`
```sql
DELIMITER $$
CREATE TRIGGER trg_maintenance_records_before_insert
BEFORE INSERT ON maintenance_records
FOR EACH ROW
BEGIN
    IF NEW.maintenance_cost < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maintenance cost cannot be negative';
    END IF;
END $$
DELIMITER ;
```
- **Backend Caller:** Fires automatically during `MaintenanceRepository.save()` on `POST /api/v1/maintenance`.
- **Frontend Effect:** Guards the "Schedule Service" modal against negative cost input.

#### 5. Custom Composite Index: `idx_maint_equip_status_date`
```sql
CREATE INDEX idx_maint_equip_status_date ON maintenance_records (equipment_id, status, maintenance_date);
```
- **Leftmost Prefix Rationale:** Speeds up work order queries filtering by `equipment_id` and `status` ordered by `maintenance_date`.
- **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT maintenance_id, maintenance_cost FROM maintenance_records 
  WHERE equipment_id = 1 AND status = 'SCHEDULED' ORDER BY maintenance_date ASC;
  ```

#### 6. Scheduled Event: `evt_weekly_maintenance_summary`
```sql
DELIMITER $$
CREATE EVENT evt_weekly_maintenance_summary
ON SCHEDULE EVERY 1 WEEK
STARTS (CURRENT_DATE + INTERVAL 1 DAY)
DO
BEGIN
    DECLARE v_weekly_cost DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_admin_id BIGINT;
    SELECT user_id INTO v_admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    
    SELECT COALESCE(SUM(maintenance_cost), 0.00) INTO v_weekly_cost
    FROM maintenance_records
    WHERE status = 'COMPLETED'
      AND maintenance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
      
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, description, created_at)
        VALUES (v_admin_id, 'WEEKLY_MAINT_AUDIT', 'maintenance_records', 0, CONCAT('7-Day maintenance cost: LKR ', v_weekly_cost), NOW());
    END IF;
END $$
DELIMITER ;
```
- **Frontend Effect:** Populates the weekly fleet maintenance expenditure audit in `AuditLogs.jsx`.

---

## 6. Core Database Transaction: Payment Settlement (ACID Defense)

### 1. Business Intuition & Failure Scenario
When a customer pays for an equipment rental, the system must update two tables atomically:
1. `payments`: Record payment as `SUCCESS`, record transaction reference, and capture timestamp `paid_at`.
2. `rentals`: Transition reservation status from `PENDING_PAYMENT` to `CONFIRMED`.

**The Danger Without an ACID Transaction:**
If payment is updated to `SUCCESS` (customer's bank account debited) but a network disconnection or database crash occurs before updating `rentals`:
> **The customer was charged, but their rental booking remains `PENDING_PAYMENT` and is automatically cancelled or expired by `evt_hourly_expire_pending_rentals`!**

### 2. ACID Properties Verification

| ACID Property | Real-World Application in CERMS | Technical Mechanism in MySQL / InnoDB |
| :--- | :--- | :--- |
| **Atomicity (All-or-Nothing)** | Both `payments` (`SUCCESS`) and `rentals` (`CONFIRMED`) commit together. If any statement fails, neither occurs. | MySQL undo logs (`innodb_undo_tablespaces`) restore pre-transaction state on `ROLLBACK`. |
| **Consistency (Integrity)** | Foreign keys (`fk_payment_rental`) and valid `ENUM` statuses are preserved. | Schema constraints and triggers enforce domain validity. |
| **Isolation (Concurrency)** | While customer A pays, concurrent queries cannot observe partial uncommitted state (no dirty reads). | InnoDB row-level locking with default `REPEATABLE READ` isolation level. |
| **Durability (Permanence)** | Once payment confirmation commits, it survives unexpected server crashes. | InnoDB Redo Log (`ib_logfile0`) flushes transaction log to persistent storage before returning success. |

### 3. Backend Spring Boot Integration
In `PaymentRepository.java`:
```java
public void callProcessPayment(Long paymentId, String paymentStatus, String transactionReference) {
    jdbcTemplate.update("CALL sp_process_payment_transaction(?, ?, ?)",
            paymentId, paymentStatus, transactionReference);
}
```

### 4. Interactive MySQL Workbench Demonstration Script
```sql
-- 1. SUCCESSFUL TRANSACTION (COMMIT):
START TRANSACTION;

UPDATE payments 
SET payment_status = 'SUCCESS', transaction_reference = 'TXN-PAYHERE-001', paid_at = NOW()
WHERE payment_id = 1;

UPDATE rentals 
SET status = 'CONFIRMED' 
WHERE rental_id = 1;

COMMIT;

-- 2. SIMULATED FAILURE & ROLLBACK:
START TRANSACTION;

UPDATE payments 
SET payment_status = 'SUCCESS', transaction_reference = 'TXN-ABORTED'
WHERE payment_id = 1;

-- Abort transaction:
ROLLBACK;

-- Verify payment reverted to original state:
SELECT payment_id, payment_status, transaction_reference FROM payments WHERE payment_id = 1;
```

---

## 7. Unique MySQL 8 Feature: Stored Generated Column

### 1. What is it?
In the `rentals` table, `rental_duration_days` is a **Stored Generated Column** (Computed Column):
```sql
ALTER TABLE rentals 
ADD COLUMN rental_duration_days INT 
GENERATED ALWAYS AS (DATEDIFF(end_date, start_date)) STORED;
```

### 2. Why this is Unique:
- **It is NOT a Function:** Does not require manual invocation (`SELECT fn(...)`). Behaves like a native physical column.
- **It is NOT a Trigger:** Requires no procedural trigger logic or write interception.
- **Physical Storage Computation:** InnoDB automatically calculates and persists the value to disk whenever `start_date` or `end_date` is inserted or updated.
- **Zero Backend Overhead:** Java insert and update queries do not compute duration; MySQL handles it natively at zero application CPU cost.

### 3. Verification Query:
```sql
SELECT rental_id, booking_reference, start_date, end_date, rental_duration_days 
FROM rentals 
LIMIT 5;
```

---

## 8. Enforced Business Rules & Safeguards

### 1. Maintenance Liability Lock
- **Rule:** If a customer has unpaid maintenance liabilities (e.g. incurred machinery damage), new equipment reservations are locked.
- **Frontend Presentation:** Warning alert banner across `EquipmentDetail.jsx` and `RentalBooking.jsx` with direct navigation to `/dashboard` to view outstanding liabilities.

### 2. 15-Minute Payment Window & Autonomous Expiration
- **Rule:** Customers have **15 minutes** from booking creation to complete payment.
- **Implementation:** `rentals.payment_deadline` is set via `COALESCE(?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`. The scheduled event `evt_hourly_expire_pending_rentals` automatically transitions overdue bookings to `EXPIRED`.

### 3. Equipment Return & Lifecycle Automation
- **Rule:** When all machines in a rental booking have been signed off by depot staff (in GOOD condition or DAMAGED), the booking automatically advances to `COMPLETED`.
- **Implementation:** Evaluated within MySQL stored procedure `sp_process_return`.

### 4. Fleet Maintenance Scheduling & Tracking
- **Due Today vs. In Progress:** Future scheduled maintenance does not block equipment. When the scheduled date arrives, the equipment is flagged as "Due Today". When yard staff click "Start Maintenance Progress", the record is marked `[IN_PROGRESS]` and payment is handled by company (`🏢 Handled by Company`).

---

## 9. REST API Endpoint Catalog

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT | Public |
| `POST` | `/api/v1/auth/register` | Register new customer account | Public |
| `GET` | `/api/v1/equipment` | Retrieve full fleet catalog | Public / Authenticated |
| `GET` | `/api/v1/equipment/{id}` | Retrieve machine details & specs | Public / Authenticated |
| `POST` | `/api/v1/equipment` | Register new equipment asset | Admin / Staff |
| `PUT` | `/api/v1/equipment/{id}` | Update machine details & rates | Admin / Staff |
| `PATCH`| `/api/v1/equipment/{id}/status` | Update machinery availability status | Staff / Admin |
| `GET` | `/api/v1/rentals` | List rental bookings with filters | Authenticated |
| `POST` | `/api/v1/rentals` | Submit new machinery hire reservation | Customer / Staff |
| `POST` | `/api/v1/rentals/{id}/cancel` | Cancel eligible reservation | Customer / Staff |
| `POST` | `/api/v1/payments/payhere/notify`| PayHere webhook IPN handler | Public |
| `POST` | `/api/v1/returns` | Process machine return & damage log | Staff / Admin |
| `GET` | `/api/v1/maintenance` | View fleet maintenance records | Staff / Admin |
| `POST` | `/api/v1/maintenance` | Schedule routine/breakdown service | Staff / Admin |
| `PATCH`| `/api/v1/maintenance/{id}/start-progress` | Flag maintenance job as in-progress | Staff / Admin |
| `PATCH`| `/api/v1/maintenance/{id}/complete` | Complete repair & restore machine | Staff / Admin |
| `GET` | `/api/v1/analytics/dashboard` | Executive KPI analytics & charts | Admin |

---

## 10. Step-by-Step Installation & Setup

### Prerequisites
- **JDK 21 LTS** or newer
- **Node.js 18.x or 20.x LTS** & **npm**
- **MySQL 8.0 or 8.4 Enterprise**
- **Apache Maven 3.8+**

---

### Step 1: Database Initialization
1. Log into your MySQL server:
   ```bash
   mysql -u root -p
   ```
2. Create database:
   ```sql
   CREATE DATABASE construction_rental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE construction_rental;
   ```
3. Execute schema and database object scripts:
   ```bash
   mysql -u root -p construction_rental < database/schema/init_schema.sql
   mysql -u root -p construction_rental < database/all_5_members_database_objects.sql
   ```
4. Verify MySQL Event Scheduler is running:
   ```sql
   SET GLOBAL event_scheduler = ON;
   SHOW VARIABLES LIKE 'event_scheduler';
   ```

---

### Step 2: Backend Setup (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment template:
   ```bash
   cp ../.env.example .env
   ```
3. Update `.env` (or `src/main/resources/application.properties`):
   ```properties
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=construction_rental
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=your_base64_encoded_minimum_256_bit_secret_key_here
   ```
4. Build and start the backend service:
   ```bash
   mvn clean spring-boot:run
   ```
   Backend will be accessible at: `http://localhost:8080`

---

### Step 3: Frontend Setup (React + Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_BASE_URL=http://localhost:8080/api/v1`.
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will launch at: `http://localhost:5173`

---

## 11. Environment Variable Configuration

### Backend Configuration (`.env` in root or `backend/`)
```env
# Database Credentials
DB_HOST=localhost
DB_PORT=3306
DB_NAME=construction_rental
DB_USERNAME=root
DB_PASSWORD=your_secure_password
DB_SSL_MODE=PREFERRED

# Server Port
SERVER_PORT=8080

# JWT Security
JWT_SECRET=c2VjdXJlX2tleV9mb3JfY2VybXNfZW50ZXJwcmlzZV9zeXN0ZW1fMjAyNg==
JWT_EXPIRATION_MS=86400000

# PayHere Gateway Credentials
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_IS_SANDBOX=true

# Cross-Origin Resource Sharing
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_PAYHERE_MERCHANT_ID=your_payhere_merchant_id
VITE_PAYHERE_MODE=sandbox
```

---

## 12. Project Directory Structure

```
construction-equipment-rental-system/
├── backend/                               # Spring Boot 3.3.4 (Java 21)
│   ├── src/main/java/com/constructionrental/
│   │   ├── config/                        # SecurityConfig, CorsConfig, JdbcConfig
│   │   ├── controller/                    # REST API Endpoints
│   │   ├── dto/                           # Data Transfer Objects
│   │   ├── model/                         # Domain Models
│   │   ├── repository/                    # Spring JDBC Repositories
│   │   └── service/                       # Business Logic Layer
│   ├── src/main/resources/
│   │   └── application.properties         # Server & Datasource Properties
│   └── pom.xml                            # Maven Dependencies
├── database/                              # MySQL 8.4 Database Scripts
│   ├── schema/
│   │   └── init_schema.sql                # Core DDL Schema
│   ├── transactions/
│   │   └── transaction_rental_payment.sql # ACID Transaction Scripts
│   ├── member1_user_customer.sql          # Member 1 Database Objects
│   ├── member2_equipment_fleet.sql        # Member 2 Database Objects
│   ├── member3_rental_booking.sql         # Member 3 Database Objects
│   ├── member4_payment_returns.sql        # Member 4 Database Objects
│   ├── member5_maintenance_reports.sql    # Member 5 Database Objects
│   ├── all_5_members_database_objects.sql # Master Unified Database Script
│   └── README.md                          # Database Distribution Guide
├── docs/                                  # Architecture & Defense Documentation
│   └── CERMS_5_Member_Database_Architecture_Defense_Guide.md
├── frontend/                              # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/                    # Reusable Buttons, Modals, Badges
│   │   ├── context/                       # AuthContext, ToastContext
│   │   ├── modules/
│   │   │   ├── admin/                     # Dashboard, UsersList, AuditLogs
│   │   │   ├── equipment/                 # EquipmentCatalog, EquipmentDetail
│   │   │   ├── maintenance/               # MaintenanceSchedule, MaintenanceList
│   │   │   ├── payments/                  # PaymentCheckout, PaymentsList
│   │   │   └── rentals/                   # RentalBooking, ReturnProcessing
│   │   ├── router/                        # AppRouter.jsx Route Definitions
│   │   └── utils/                         # formatters.js, constants.js, api.js
│   ├── package.json                       # Dependencies & Scripts
│   ├── tailwind.config.js                 # Tailwind Design System
│   └── vite.config.js                     # Vite Config
├── .env.example                           # Root Environment Template
└── README.md                              # Master System Documentation
```

---

## 13. Academic Defense & Viva Examination Cheatsheet

### Q1: Why use Spring JDBC instead of Hibernate / JPA?
> **Answer:** Spring JDBC provides deterministic query execution, eliminates lazy-loading bugs, and allows direct execution of MySQL stored procedures, views, and functions without ORM translation overhead or unoptimized auto-generated queries.

### Q2: Why is the transaction implemented inside a MySQL stored procedure instead of Java `@Transactional`?
> **Answer:** Managing the transaction boundary natively inside MySQL (`START TRANSACTION ... COMMIT`) encapsulates ACID atomicity within the database engine. Even if the backend server loses network connectivity or restarts during execution, MySQL will roll back or commit atomically, eliminating partial states.

### Q3: What is the benefit of the Stored Generated Column in MySQL 8?
> **Answer:** `rental_duration_days` is computed natively by InnoDB at the storage layer upon row write. This ensures indexable, zero-latency duration values without requiring manual function calls or trigger overhead.

### Q4: How does the system handle booking expiration?
> **Answer:** Overdue reservations are expired automatically by the MySQL Scheduled Event `evt_hourly_expire_pending_rentals`, which executes every 15 minutes to release locked fleet equipment.

### Q5: How is index optimization validated?
> **Answer:** Every composite index is designed with leftmost prefix rules (e.g. `(is_active, status)` for equipment catalog queries) and verified using MySQL `EXPLAIN` to confirm index-range scans instead of full table scans (`ALL`).

---

## 14. License & Acknowledgments

This project is licensed under the [MIT License](LICENSE).

Developed as an academic enterprise system project for **ICT3222: Advanced Database Systems**.
- **Member 1**: User Authentication, Customer Lifecycle & Security Audit Logging
- **Member 2**: Machinery Fleet Inventory, Categorization & Flexible Pricing Engine
- **Member 3**: Rental Booking System, Availability Conflicts & Expiration Engine
- **Member 4**: PayHere Payment Gateway Integration, Machinery Returns & Damage Assessment
- **Member 5**: Fleet Maintenance Schedules, Routine Repairs & Workshop Cost Analytics
