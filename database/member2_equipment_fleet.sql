USE construction_rental;

-- ============================================================================
-- MEMBER 2: Equipment Fleet & Category Management Module
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VIEW: view_available_equipment
-- ----------------------------------------------------------------------------
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

-- Test Query:
-- SELECT * FROM view_available_equipment;


-- ----------------------------------------------------------------------------
-- 2. SCALAR FUNCTION: fn_get_equipment_daily_rate
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_get_equipment_daily_rate;

DELIMITER $$

CREATE FUNCTION fn_get_equipment_daily_rate(p_equipment_id BIGINT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_daily_rate DECIMAL(10,2) DEFAULT 0.00;

    SELECT daily_rate INTO v_daily_rate
    FROM equipment
    WHERE equipment_id = p_equipment_id;

    RETURN v_daily_rate;
END $$

DELIMITER ;

-- Test Query:
-- SELECT fn_get_equipment_daily_rate(1);


-- ----------------------------------------------------------------------------
-- 3. STORED PROCEDURE: sp_update_equipment_status
-- ----------------------------------------------------------------------------
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

-- Test Query:
-- CALL sp_update_equipment_status(1, 'AVAILABLE', @success);
-- SELECT @success;


-- ----------------------------------------------------------------------------
-- 4. TRIGGER: trg_validate_equipment_rates
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_validate_equipment_rates;

DELIMITER $$

CREATE TRIGGER trg_validate_equipment_rates
BEFORE INSERT ON equipment
FOR EACH ROW
BEGIN
    IF NEW.daily_rate < 0 OR NEW.hourly_rate < 0 OR NEW.monthly_rate < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Equipment rates cannot be negative';
    END IF;
END $$

DELIMITER ;


-- ----------------------------------------------------------------------------
-- 5. COMPOSITE INDEX: idx_equipment_active_status
-- ----------------------------------------------------------------------------
CREATE INDEX idx_equipment_active_status ON equipment (is_active, status);

-- EXPLAIN verification:
-- EXPLAIN SELECT equipment_id, equipment_name 
-- FROM equipment 
-- WHERE is_active = 1 AND status = 'AVAILABLE';


-- ----------------------------------------------------------------------------
-- 6. SCHEDULED EVENT: evt_daily_maintenance_status_check
-- ----------------------------------------------------------------------------
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
