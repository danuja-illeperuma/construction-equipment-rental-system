-- ============================================================================
-- CONSTRUCTION EQUIPMENT RENTAL MANAGEMENT SYSTEM (CERMS)
-- 5-MEMBER DATABASE ARCHITECTURE SPECIFICATION (ICT3222)
-- ============================================================================
-- Database: construction_rental (MySQL 8.4)
-- This master file contains the EXACT quota for all 5 group members:
--   - 5 Views (1 per member)
--   - 5 Scalar Functions (1 per member)
--   - 7 Stored Procedures (M1:1, M2:1, M3:1, M4:2, M5:2)
--   - 5 Triggers (1 per member)
--   - 5 Composite Indexes (1 per member)
--   - 5 Scheduled Events (1 per member)
-- All extra/deprecated procedures (sp_expire_rental, sp_create_rental,
-- sp_add_rental_item, sp_create_payment, sp_record_damage), extra triggers,
-- and extra views have been permanently dropped.
-- ============================================================================

USE construction_rental;

-- ============================================================================
-- SECTION 1: MEMBER 1 - USER & CUSTOMER MANAGEMENT
-- ============================================================================

-- View (Member 1)
DROP VIEW IF EXISTS view_active_customers;
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

-- Function (Member 1)
DROP FUNCTION IF EXISTS fn_customer_booking_count;
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

-- Procedure (Member 1)
DROP PROCEDURE IF EXISTS sp_toggle_customer_active;
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

-- Trigger (Member 1)
DROP TRIGGER IF EXISTS trg_validate_customer_email;
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

-- Composite Index (Member 1)
DROP INDEX IF EXISTS idx_customers_type_active ON customers;
CREATE INDEX idx_customers_type_active ON customers (is_active, customer_type);

-- Scheduled Event (Member 1)
DROP EVENT IF EXISTS evt_daily_customer_count_log;
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


-- ============================================================================
-- SECTION 2: MEMBER 2 - EQUIPMENT FLEET & CATEGORY MANAGEMENT
-- ============================================================================

-- View (Member 2)
DROP VIEW IF EXISTS view_available_equipment;
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

-- Function (Member 2)
DROP FUNCTION IF EXISTS fn_get_equipment_daily_rate;
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

-- Procedure (Member 2)
DROP PROCEDURE IF EXISTS sp_update_equipment_status;
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

-- Trigger (Member 2)
DROP TRIGGER IF EXISTS trg_validate_equipment_rates;
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

-- Composite Index (Member 2)
DROP INDEX IF EXISTS idx_equipment_active_status ON equipment;
CREATE INDEX idx_equipment_active_status ON equipment (is_active, status);

-- Scheduled Event (Member 2)
DROP EVENT IF EXISTS evt_daily_maintenance_status_check;
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


-- ============================================================================
-- SECTION 3: MEMBER 3 - RENTAL & AVAILABILITY
-- ============================================================================

-- View (Member 3)
DROP VIEW IF EXISTS view_active_rentals;
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

-- Function (Member 3)
DROP FUNCTION IF EXISTS calculate_rental_amount;
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

-- Procedure (Member 3): sp_cancel_rental
DROP PROCEDURE IF EXISTS sp_cancel_rental;
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

-- Trigger (Member 3)
DROP TRIGGER IF EXISTS trg_rental_items_before_insert;
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

-- Composite Index (Member 3)
DROP INDEX IF EXISTS idx_rentals_status_dates ON rentals;
CREATE INDEX idx_rentals_status_dates ON rentals (status, start_date, end_date);

-- Scheduled Event (Member 3)
DROP EVENT IF EXISTS evt_hourly_expire_pending_rentals;
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


-- ============================================================================
-- SECTION 4: MEMBER 4 - PAYMENTS, RETURNS & DAMAGE INSPECTION
-- ============================================================================

-- View (Member 4)
DROP VIEW IF EXISTS view_successful_payments;
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

-- Function (Member 4)
DROP FUNCTION IF EXISTS calculate_late_charge;
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

-- Procedure (Member 4): sp_process_return
DROP PROCEDURE IF EXISTS sp_process_return;
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

    IF v_unreturned_count = 0 THEN
        UPDATE rentals
        SET status = 'COMPLETED'
        WHERE rental_id = v_rental_id;
    END IF;
END $$
DELIMITER ;

-- Procedure / Transaction (Member 4): sp_process_payment_transaction
-- Executes an atomic database transaction with automatic SQLEXCEPTION rollback.
-- Updates payments to SUCCESS and associated rental to CONFIRMED atomically.
DROP PROCEDURE IF EXISTS sp_process_payment_transaction;
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

-- Trigger (Member 4)
DROP TRIGGER IF EXISTS trg_payments_after_update;
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

-- Composite Index (Member 4)
DROP INDEX IF EXISTS idx_payments_status_created ON payments;
CREATE INDEX idx_payments_status_created ON payments (payment_status, created_at);

-- Scheduled Event (Member 4)
DROP EVENT IF EXISTS evt_daily_revenue_log;
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


-- ============================================================================
-- SECTION 5: MEMBER 5 - MAINTENANCE MANAGEMENT, REPORTS & AUDIT LOGS
-- ============================================================================

-- View (Member 5)
DROP VIEW IF EXISTS v_equipment_maintenance_summary;
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

-- Function (Member 5)
DROP FUNCTION IF EXISTS calculate_equipment_maintenance_cost;
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

-- Procedure (Member 5): sp_complete_maintenance
DROP PROCEDURE IF EXISTS sp_complete_maintenance;
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

-- Trigger (Member 5)
DROP TRIGGER IF EXISTS trg_maintenance_records_before_insert;
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

-- Composite Index (Member 5)
DROP INDEX IF EXISTS idx_maint_equip_status_date ON maintenance_records;
CREATE INDEX idx_maint_equip_status_date ON maintenance_records (equipment_id, status, maintenance_date);

-- Scheduled Event (Member 5)
DROP EVENT IF EXISTS evt_weekly_maintenance_summary;
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
