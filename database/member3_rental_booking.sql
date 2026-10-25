USE construction_rental;

-- ============================================================================
-- MEMBER 3: Rental & Availability Module
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VIEW: view_active_rentals
-- ----------------------------------------------------------------------------
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

-- Test Query:
-- SELECT * FROM view_active_rentals;


-- ----------------------------------------------------------------------------
-- 2. SCALAR FUNCTION: calculate_rental_amount
-- ----------------------------------------------------------------------------
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

-- Test Query:
-- SELECT calculate_rental_amount(2, 5.0, 1500.00);


-- ----------------------------------------------------------------------------
-- 3. STORED PROCEDURE: sp_cancel_rental
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 4. TRIGGER: trg_rental_items_before_insert
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- 5. COMPOSITE INDEX: idx_rentals_status_dates
-- ----------------------------------------------------------------------------
CREATE INDEX idx_rentals_status_dates ON rentals (status, start_date, end_date);

-- EXPLAIN verification:
-- EXPLAIN SELECT rental_id, booking_reference 
-- FROM rentals 
-- WHERE status = 'ACTIVE' AND start_date <= '2026-10-30' AND end_date >= '2026-10-20';


-- ----------------------------------------------------------------------------
-- 6. SCHEDULED EVENT: evt_hourly_expire_pending_rentals
-- ----------------------------------------------------------------------------
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
