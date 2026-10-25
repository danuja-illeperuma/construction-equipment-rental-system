USE construction_rental;

-- ============================================================================
-- MEMBER 1: User & Customer Management Module
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VIEW: view_active_customers
-- ----------------------------------------------------------------------------
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

-- Test Query:
-- SELECT * FROM view_active_customers;


-- ----------------------------------------------------------------------------
-- 2. SCALAR FUNCTION: fn_customer_booking_count
-- ----------------------------------------------------------------------------
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

-- Test Query (Slide 15):
-- SELECT customer_id, name, fn_customer_booking_count(customer_id) AS total_valid_bookings FROM customers;
-- SELECT fn_customer_booking_count(1);


-- ----------------------------------------------------------------------------
-- 3. STORED PROCEDURE: sp_toggle_customer_active
-- ----------------------------------------------------------------------------
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

    -- If admin is deactivating, check if customer currently has equipment on rent
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

-- Test Query:
-- CALL sp_toggle_customer_active(1, TRUE, @success, @msg);
-- SELECT @success AS Success, @msg AS Message;
-- SELECT customer_id, name, is_active FROM customers WHERE customer_id = 1;


-- ----------------------------------------------------------------------------
-- 4. TRIGGER: trg_validate_customer_email
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_validate_customer_email;

DELIMITER $$

CREATE TRIGGER trg_validate_customer_email
BEFORE INSERT ON customers
FOR EACH ROW
BEGIN
    IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Customer name cannot be empty';
    END IF;

    IF NEW.phone IS NULL OR TRIM(NEW.phone) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Customer phone cannot be empty';
    END IF;

    IF NEW.email NOT LIKE '%@%.%' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid email address format';
    END IF;
END $$

DELIMITER ;

-- Test 1 (Invalid email - should fail):
-- INSERT INTO customers (customer_type, name, phone, email, password_hash, is_active, created_at)
-- VALUES ('INDIVIDUAL', 'Test User', '0779998877', 'invalid-email-no-at-sign', 'dummyhash', 1, NOW());

-- Test 2 (Valid email - should succeed):
-- INSERT INTO customers (customer_type, name, phone, email, password_hash, is_active, created_at)
-- VALUES ('INDIVIDUAL', 'Valid User', '0779998877', 'valid.user@example.com', 'dummyhash', 1, NOW());


-- ----------------------------------------------------------------------------
-- 5. COMPOSITE INDEX: idx_customers_type_active
-- ----------------------------------------------------------------------------
CREATE INDEX idx_customers_type_active 
ON customers (is_active, customer_type);

-- EXPLAIN Verification:
-- 1. Query testing both columns (Uses composite index):
-- EXPLAIN SELECT customer_id, name, email FROM customers WHERE is_active = 1 AND customer_type = 'CONTRACTOR';

-- 2. Query testing ONLY leftmost column (Still uses index):
-- EXPLAIN SELECT customer_id, name, email FROM customers WHERE is_active = 1;

-- 3. Query testing only customer_type without is_active (Cannot use leftmost prefix):
-- EXPLAIN SELECT customer_id, name, email FROM customers WHERE customer_type = 'CONTRACTOR';


-- ----------------------------------------------------------------------------
-- 6. SCHEDULED EVENT: evt_daily_customer_count_log
-- ----------------------------------------------------------------------------
DROP EVENT IF EXISTS evt_daily_customer_count_log;

DELIMITER $$

CREATE EVENT evt_daily_customer_count_log
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE + INTERVAL 1 DAY)
DO
BEGIN
    DECLARE v_active_count INT;
    DECLARE v_admin_id BIGINT;

    -- Look up system admin user ID
    SELECT user_id INTO v_admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    
    -- Count active customer accounts
    SELECT COUNT(*) INTO v_active_count FROM customers WHERE is_active = 1;

    -- Record nightly metric in audit_logs
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, description, created_at)
        VALUES (v_admin_id, 'DAILY_AUDIT', 'customers', 0, CONCAT('Active customers count: ', v_active_count), NOW());
    END IF;
END $$

DELIMITER ;

-- Verification:
-- SHOW PROCESSLIST;
-- SHOW VARIABLES LIKE 'event_scheduler';
-- SHOW EVENTS FROM construction_rental;
