USE construction_rental;

-- ============================================================================
-- MEMBER 5: Maintenance Management, Reports & Audit Logs Module
-- ============================================================================

-- ============================================================================
-- 1. VIEW: v_equipment_maintenance_summary
-- ============================================================================
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

-- Test View:
-- SELECT * FROM v_equipment_maintenance_summary;

-- ============================================================================
-- 2. SCALAR FUNCTION: calculate_equipment_maintenance_cost
-- ============================================================================
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

-- Test Function:
-- SELECT calculate_equipment_maintenance_cost(1, NULL, NULL);

-- ============================================================================
-- 3. STORED PROCEDURE: sp_complete_maintenance
-- ============================================================================
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
    FROM maintenance_records WHERE maintenance_id = p_maintenance_id;
    
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

-- ============================================================================
-- 4. TRIGGER: trg_maintenance_records_before_insert
-- ============================================================================
DROP TRIGGER IF EXISTS trg_maintenance_records_before_insert;
DELIMITER $$
CREATE TRIGGER trg_maintenance_records_before_insert
BEFORE INSERT ON maintenance_records
FOR EACH ROW
BEGIN
    IF NEW.maintenance_cost < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Maintenance cost cannot be negative';
    END IF;
END $$
DELIMITER ;

-- ============================================================================
-- 5. COMPOSITE INDEX & EXPLAIN: idx_maint_equip_status_date
-- ============================================================================
CREATE INDEX idx_maint_equip_status_date 
ON maintenance_records (equipment_id, status, maintenance_date);

-- EXPLAIN verification:
-- EXPLAIN SELECT maintenance_id, maintenance_cost 
-- FROM maintenance_records 
-- WHERE equipment_id = 1 AND status = 'PENDING';

-- ============================================================================
-- 6. SCHEDULED EVENT: evt_weekly_maintenance_summary
-- ============================================================================
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
