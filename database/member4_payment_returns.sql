USE construction_rental;

-- ============================================================================
-- MEMBER 4: Payments, Returns & Damage Inspection Module
-- ============================================================================

-- ============================================================================
-- 1. VIEW: view_successful_payments
-- ============================================================================
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

-- Test View:
-- SELECT * FROM view_successful_payments;

-- ============================================================================
-- 2. SCALAR FUNCTION: calculate_late_charge
-- ============================================================================
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

-- Test Function:
-- SELECT calculate_late_charge(1, NOW());

-- ============================================================================
-- 3A. STORED PROCEDURE: sp_process_return
-- ============================================================================
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

    -- Automated Rental Lifecycle Check:
    -- If all items belonging to this rental have been returned, mark the entire rental as COMPLETED.
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

-- ============================================================================
-- 3B. STORED PROCEDURE / TRANSACTION: sp_process_payment_transaction
-- ============================================================================
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

-- ============================================================================
-- 4. TRIGGER: trg_payments_after_update
-- ============================================================================
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

-- ============================================================================
-- 5. COMPOSITE INDEX & EXPLAIN: idx_payments_status_created
-- ============================================================================
CREATE INDEX idx_payments_status_created ON payments (payment_status, created_at);

-- EXPLAIN verification:
-- EXPLAIN SELECT payment_id, amount, paid_at 
-- FROM payments 
-- WHERE payment_status = 'SUCCESS' 
-- ORDER BY created_at DESC;

-- ============================================================================
-- 6. SCHEDULED EVENT: evt_daily_revenue_log
-- ============================================================================
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
