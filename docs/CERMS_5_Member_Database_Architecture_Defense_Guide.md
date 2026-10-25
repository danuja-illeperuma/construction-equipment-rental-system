# Construction Equipment Rental & Management System (CERMS)
## Authoritative Database Architecture & Viva Defense Guide (ICT3222)

**Academic Module:** ICT3222 Advanced Database Systems / Enterprise Relational Systems  
**Database Host:** MySQL 8.4 Enterprise (`construction_rental` hosted on Aiven Cloud)  
**Backend:** Spring Boot 3.3.4 (Java 21, Spring JDBC, HikariCP Connection Pool, JWT Security)  
**Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts  
**Last Updated:** October 2026 (Production Release Version)

---

## 1. Master 5-Member Workload & Object Ownership Matrix

The database architecture strictly enforces the balanced 5-member syllabus quota where every student owns their distinct domain tables and database objects:
* **5 Views** (1 per member)
* **5 Scalar User-Defined Functions** (1 per member)
* **5 Stored Procedures** (1 per member)
* **5 Database Triggers** (1 per member)
* **5 Custom Composite Indexes** (1 per member)
* **5 Scheduled Database Events** (1 per member)
* **1 Native Database Transaction** (Multi-table ACID Atomicity)
* **1 Unique Schema Feature** (MySQL 8 Stored Generated Column)

| Member | Domain & Tables | View | Scalar Function | Stored Procedure | Database Trigger | Composite Index | Scheduled Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **User & Customer**<br>`customers`, `users`, `audit_logs` | `view_active_customers` | `fn_customer_booking_count` | `sp_toggle_customer_active` | `trg_validate_customer_email` | `idx_customers_type_active` | `evt_daily_customer_count_log` |
| **Member 2** | **Equipment Fleet**<br>`equipment`, `equipment_categories` | `view_available_equipment` | `fn_get_equipment_daily_rate` | `sp_update_equipment_status` | `trg_validate_equipment_rates` | `idx_equipment_active_status` | `evt_daily_maintenance_status_check` |
| **Member 3** | **Rental & Booking**<br>`rentals`, `rental_items` | `view_active_rentals` | `calculate_rental_amount` | `sp_cancel_rental` | `trg_rental_items_before_insert` | `idx_rentals_status_dates` | `evt_hourly_expire_pending_rentals` |
| **Member 4** | **Payment & Returns**<br>`payments`, `equipment_returns`, `damage_reports` | `view_successful_payments` | `calculate_late_charge` | `sp_process_return`<br>`sp_process_payment_transaction` | `trg_payments_after_update` | `idx_payments_status_created` | `evt_daily_revenue_log` |
| **Member 5** | **Maintenance & Reports**<br>`maintenance_records`, `audit_logs` | `v_equipment_maintenance_summary` | `calculate_equipment_maintenance_cost` | `sp_complete_maintenance` | `trg_maintenance_records_before_insert` | `idx_maint_equip_status_date` | `evt_weekly_maintenance_summary` |

---

## 2. Member 1: User & Customer Management Module

### Domain Tables: `customers`, `users`, `audit_logs`

#### 1. View: `view_active_customers`
* **SQL Definition:** Filters customers where `is_active = 1`, projecting public contact fields while protecting confidential password hashes.
* **Backend Caller:** `CustomerRepository.java` (`findAllActive()`) via `GET /api/v1/customers`.
* **Frontend GUI Effect:** Populates the active customer table in `UsersList.jsx` and the customer dropdown when staff reserves machinery in `RentalBooking.jsx`.

#### 2. User-Defined Function: `fn_customer_booking_count(p_customer_id)`
* **SQL Definition:** Scalar function returning the total count of non-cancelled rentals placed by a given customer ID.
* **Backend Caller:** `CustomerRepository.java` via `SELECT fn_customer_booking_count(?)` on `GET /api/v1/customers/{id}`.
* **Frontend GUI Effect:** Displays the "Total Bookings Made: X" metric badge on the client profile card in `CustomerProfile.jsx` and the admin user modal.

#### 3. Stored Procedure: `sp_toggle_customer_active(p_customer_id, p_is_active, OUT p_success, OUT p_message)`
* **SQL Definition:** Toggles customer activation status (`1` or `0`). Includes an active-rental safety lock: if a customer currently has machines on site (`ACTIVE` or `CONFIRMED`), deactivation is safely rejected. Writes an audit entry to `audit_logs`.
* **Backend Caller:** `CustomerRepository.java` via `CallableStatement` on `PATCH /api/v1/customers/{id}/status`.
* **Frontend GUI Effect:** Triggered when the administrator flips the "Active / Disabled" toggle in `UsersList.jsx`. Immediately disables login credentials for the deactivated user.

#### 4. Database Trigger: `trg_validate_customer_email`
* **SQL Definition:** `BEFORE INSERT ON customers` trigger enforcing valid email syntax (`%_@_%._%`) and preventing blank names. Throws SQLState `45000` on validation failure.
* **Backend Caller:** Fires automatically during `CustomerRepository.save()` on `POST /api/v1/auth/register`.
* **Frontend GUI Effect:** Protects the registration portal `Register.jsx` from corrupt entries.

#### 5. Custom Composite Index: `idx_customers_type_active`
* **Definition:** `CREATE INDEX idx_customers_type_active ON customers (is_active, customer_type);`
* **Leftmost Prefix Rationale:** Customer lookup queries always filter first by `is_active = 1` and second by `customer_type = 'INDIVIDUAL' | 'COMPANY' | 'CONTRACTOR'`.
* **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT customer_id, name, email FROM customers WHERE is_active = 1 AND customer_type = 'CONTRACTOR';
  ```

#### 6. Scheduled Event: `evt_daily_customer_count_log`
* **SQL Definition:** Runs nightly at `00:00:00`. Tallies active accounts (`SELECT COUNT(*) FROM customers WHERE is_active = 1`) and writes a snapshot row into `audit_logs` (`CUSTOMER_METRICS`).
* **Frontend GUI Effect:** Populates the system telemetry timeline in `AuditLogs.jsx`.

---

## 3. Member 2: Equipment Fleet & Category Management Module

### Domain Tables: `equipment`, `equipment_categories`

#### 1. View: `view_available_equipment`
* **SQL Definition:** Projects active machines (`is_active = 1` AND `status = 'AVAILABLE'`) joined with category details and rental rates (`daily_rate`, `hourly_rate`, `monthly_rate`).
* **Backend Caller:** `EquipmentRepository.java` (`findAvailableCatalog()`) on `GET /api/v1/equipment/catalog`.
* **Frontend GUI Effect:** Renders available machinery cards on `EquipmentCatalog.jsx` and the client portal. Machines under maintenance or currently on hire are automatically excluded.

#### 2. User-Defined Function: `fn_get_equipment_daily_rate(p_equipment_id)`
* **SQL Definition:** Scalar function returning the calibrated daily hire rate for any equipment unit.
* **Backend Caller:** `EquipmentRepository.java` via `SELECT fn_get_equipment_daily_rate(?)`.
* **Frontend GUI Effect:** Powers dynamic cost estimation on `EquipmentDetail.jsx` and `QuotationPage.jsx`.

#### 3. Stored Procedure: `sp_update_equipment_status(p_equipment_id, p_new_status, OUT p_success)`
* **SQL Definition:** Validates valid fleet status transitions (`AVAILABLE`, `RENTED`, `MAINTENANCE`) and updates `equipment.status`.
* **Backend Caller:** `EquipmentRepository.java` on `PATCH /api/v1/equipment/{id}/status`.
* **Frontend GUI Effect:** Used in `EquipmentManagement.jsx`. When staff updates machine availability, status badges instantly update (Emerald, Blue, Amber).

#### 4. Database Trigger: `trg_validate_equipment_rates`
* **SQL Definition:** `BEFORE INSERT ON equipment` trigger ensuring hire rates and deposit values are non-negative. Throws SQLState `45000` if negative rates are detected.
* **Backend Caller:** Automatically fires during `EquipmentRepository.save()`.
* **Frontend GUI Effect:** Protects the "Add Machine" modal in `EquipmentManagement.jsx`.

#### 5. Custom Composite Index: `idx_equipment_active_status`
* **Definition:** `CREATE INDEX idx_equipment_active_status ON equipment (is_active, status);`
* **Leftmost Prefix Rationale:** Accelerates public catalog queries filtering by `WHERE is_active = 1 AND status = 'AVAILABLE'`.
* **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT equipment_id, equipment_name, daily_rate FROM equipment WHERE is_active = 1 AND status = 'AVAILABLE';
  ```

#### 6. Scheduled Event: `evt_daily_maintenance_status_check`
* **SQL Definition:** Runs daily at `02:00:00`. Checks for maintenance work orders due today or earlier and automatically sets `equipment.status = 'MAINTENANCE'`.
* **Frontend GUI Effect:** Automatically removes scheduled service machinery from the public booking catalog before depot operations begin.

---

## 4. Member 3: Rental Operations & Availability Module

### Domain Tables: `rentals`, `rental_items`

#### 1. View: `view_active_rentals`
* **SQL Definition:** Live operations view joining rentals in `CONFIRMED` or `ACTIVE` status with customer contact details and booking timestamps.
* **Backend Caller:** `RentalRepository.java` (`findActiveRentals()`) on `GET /api/v1/rentals/active`.
* **Frontend GUI Effect:** Powers the "Active on Site" board in `RentalsManagement.jsx` and the internal fleet operations dashboard.

#### 2. User-Defined Function: `calculate_rental_amount(p_quantity, p_duration, p_unit_rate)`
* **SQL Definition:** Deterministic calculation: `ROUND(p_quantity * p_duration * p_unit_rate, 2)`. Rejects non-positive quantities and negative durations.
* **Backend Caller:** `RentalItemRepository.java` (`callCalculateRentalAmount()`).
* **Frontend GUI Effect:** Accurately computes line-item rental charges on `QuotationPage.jsx` and `RentalBooking.jsx`.

#### 3. Stored Procedure: `sp_cancel_rental(p_rental_id)`
* **SQL Definition:** Cancels an eligible booking if its status is `PENDING_PAYMENT` or `CONFIRMED`. Safely rejects cancellation of dispatched `ACTIVE` or `COMPLETED` rentals with an informative SQLState `45000` error.
* **Backend Caller:** `RentalRepository.java` (`cancelRental()`) on `POST /api/v1/rentals/{id}/cancel`.
* **Frontend GUI Effect:** Triggered when a customer or staff clicks "Cancel Rental Booking" on `MyRentals.jsx` or `RentalDetail.jsx`.

#### 4. Database Trigger: `trg_rental_items_before_insert`
* **SQL Definition:** `BEFORE INSERT ON rental_items` trigger strictly enforcing `quantity > 0`, `duration > 0`, `unit_rate >= 0`, and `item_amount >= 0`.
* **Backend Caller:** Fires automatically during `RentalItemRepository.save()`.
* **Frontend GUI Effect:** Prevents corrupted or negative line-item bookings.

#### 5. Custom Composite Index: `idx_rentals_status_dates`
* **Definition:** `CREATE INDEX idx_rentals_status_dates ON rentals (status, start_date, end_date);`
* **Leftmost Prefix Rationale:** The conflict detection engine checks non-terminal statuses (`PENDING_PAYMENT`, `CONFIRMED`, `ACTIVE`) across overlapping rental date windows.
* **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT rental_id, booking_reference FROM rentals WHERE status = 'ACTIVE' AND start_date <= '2026-11-05' AND end_date >= '2026-11-01';
  ```

#### 6. Scheduled Event: `evt_hourly_expire_pending_rentals`
* **SQL Definition:** Runs autonomously every **15 minutes** in MySQL:
  ```sql
  UPDATE rentals
  SET status = 'EXPIRED'
  WHERE status = 'PENDING_PAYMENT'
    AND NOW() > payment_deadline;
  ```
* **Frontend GUI Effect:** Pending bookings that are not paid within 15 minutes automatically transition to "EXPIRED", releasing locked fleet machinery back to available inventory.

---

## 5. Member 4: Payments, Returns & Damage Assessment Module

### Domain Tables: `payments`, `equipment_returns`, `damage_reports`

#### 1. View: `view_successful_payments`
* **SQL Definition:** Audited financial ledger projecting completed payment transactions joined with customer names and booking references.
* **Backend Caller:** `PaymentRepository.java` on `GET /api/v1/payments/successful`.
* **Frontend GUI Effect:** Populates the completed revenue transaction table on `PaymentsList.jsx` and financial report analytics.

#### 2. User-Defined Function: `calculate_late_charge(p_rental_item_id, p_returned_at)`
* **SQL Definition:** Compares return datetime against scheduled end date. If overdue, computes `DATEDIFF` and applies a 1.5x penalty formula: `ROUND(v_days_late * v_unit_rate * 1.5, 2)`.
* **Backend Caller:** `ReturnRepository.java` (`callCalculateLateCharge()`).
* **Frontend GUI Effect:** Displays the calculated late fee on `ReturnProcessing.jsx` when yard technicians inspect machines.

#### 3. Stored Procedure: `sp_process_return(p_rental_item_id, p_returned_at, p_condition, p_notes, p_recorded_by, OUT p_return_id, OUT p_late_charge)`
* **SQL Definition:** Inserts return record, computes late charges, updates machine status (`AVAILABLE` if GOOD, `MAINTENANCE` if DAMAGED), and checks if all rental line items for the booking have been returned. When all items are returned, **automatically advances the rental's lifecycle status to `COMPLETED`**.
* **Backend Caller:** `ReturnRepository.java` (`callProcessReturn()`) called from `ReturnService.java` on `POST /api/v1/returns`.
* **Frontend GUI Effect:** Used by staff in `ReturnProcessing.jsx`. Marks returns, updates fleet availability, and changes the booking from "Active on Site" to "COMPLETED".

#### 4. Database Trigger: `trg_payments_after_update`
* **SQL Definition:** `AFTER UPDATE ON payments` trigger. When `payment_status` becomes `SUCCESS`, automatically transitions the associated rental from `PENDING_PAYMENT` to `CONFIRMED`.
* **Backend Caller:** Fires automatically during payment processing.
* **Frontend GUI Effect:** Booking status instantly switches to "CONFIRMED" in `PaymentCheckout.jsx` and `MyRentals.jsx`.

#### 5. Custom Composite Index: `idx_payments_status_created`
* **Definition:** `CREATE INDEX idx_payments_status_created ON payments (payment_status, created_at);`
* **Leftmost Prefix Rationale:** Finance ledger queries filter by `payment_status = 'SUCCESS'` ordered by `created_at DESC`.
* **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT payment_id, amount, paid_at FROM payments WHERE payment_status = 'SUCCESS' ORDER BY created_at DESC;
  ```

#### 6. Scheduled Event: `evt_daily_revenue_log`
* **SQL Definition:** Runs nightly at `23:59:00`. Aggregates daily successful revenue and writes an audit summary into `audit_logs` (`DAILY_REVENUE_SNAPSHOT`).
* **Frontend GUI Effect:** Renders audit logs in `AuditLogs.jsx` and revenue trends in `Reports.jsx`.

---

## 6. Member 5: Maintenance Management & System Analytics Module

### Domain Tables: `maintenance_records`, `audit_logs`

#### 1. View: `v_equipment_maintenance_summary`
* **SQL Definition:** Aggregates maintenance records per machine: total jobs, total expenditure, and last service date.
* **Backend Caller:** `MaintenanceRepository.java` on `GET /api/v1/maintenance/summary`.
* **Frontend GUI Effect:** Populates maintenance metric cards at the top of `MaintenanceList.jsx`.

#### 2. User-Defined Function: `calculate_equipment_maintenance_cost(p_equipment_id, p_start_date, p_end_date)`
* **SQL Definition:** Calculates total maintenance costs incurred for a machine across all time or an optional date range.
* **Backend Caller:** `ReportRepository.java` on `GET /api/v1/reports/maintenance/{equipmentId}/cost`.
* **Frontend GUI Effect:** Displays lifetime repair expenditure on `EquipmentDetail.jsx` and `Reports.jsx`.

#### 3. Stored Procedure: `sp_complete_maintenance(p_maintenance_id, p_actual_cost, OUT p_success)`
* **SQL Definition:** Completes a work order, records actual repair cost, marks the maintenance record `COMPLETED`, and returns the machine status to `AVAILABLE` for customer booking.
* **Backend Caller:** `MaintenanceRepository.java` (`completeMaintenance()`) on `PATCH /api/v1/maintenance/{id}/complete`.
* **Frontend GUI Effect:** Used by staff technicians in `MaintenanceList.jsx` to conclude work orders and immediately restore machines to the available fleet.

#### 4. Database Trigger: `trg_maintenance_records_before_insert`
* **SQL Definition:** `BEFORE INSERT ON maintenance_records` trigger preventing negative maintenance cost values.
* **Backend Caller:** Fires automatically during `MaintenanceRepository.save()`.
* **Frontend GUI Effect:** Protects the "Schedule Service" modal in `MaintenanceList.jsx`.

#### 5. Custom Composite Index: `idx_maint_equip_status_date`
* **Definition:** `CREATE INDEX idx_maint_equip_status_date ON maintenance_records (equipment_id, status, maintenance_date);`
* **Leftmost Prefix Rationale:** Speeds up work order queries filtering by `equipment_id` and `status` ordered by `maintenance_date`.
* **EXPLAIN Verification:**
  ```sql
  EXPLAIN SELECT maintenance_id, maintenance_cost FROM maintenance_records WHERE equipment_id = 1 AND status = 'PENDING';
  ```

#### 6. Scheduled Event: `evt_weekly_maintenance_summary`
* **SQL Definition:** Runs weekly on Mondays at `06:00:00`. Tallies the past 7 days' maintenance expenses and writes a summary into `audit_logs` (`WEEKLY_MAINT_AUDIT`).
* **Frontend GUI Effect:** Visible in `AuditLogs.jsx`.

---

## 7. Core Database Transaction: Rental Payment & Booking Confirmation (ACID Defense)

### 1. Business Scenario & Intuition
When a customer pays for an equipment rental, the system must update two tables simultaneously:
1. `payments`: Record payment as `SUCCESS`, store transaction reference, and record timestamp `paid_at`.
2. `rentals`: Transition reservation status from `PENDING_PAYMENT` to `CONFIRMED`.

### 2. The Danger Without a Transaction (Why Auto-Commit Fails)
* If the payment update succeeds (money collected) but the database or network drops before the rental is marked `CONFIRMED`:
  > **The customer was charged, but their rental booking remains `PENDING_PAYMENT` and will be automatically cancelled or expired by `evt_hourly_expire_pending_rentals`!**
* If the rental is marked `CONFIRMED` without updating the payment, the business loses revenue.
* **Solution:** An explicit database transaction boundary (`START TRANSACTION ... COMMIT / ROLLBACK`). Both updates succeed together or both revert completely.

### 3. ACID Properties Table for Examiners

| ACID Property | Real-World Application in CERMS | Technical Mechanism in MySQL / InnoDB |
| :--- | :--- | :--- |
| **Atomicity (All-or-Nothing)** | Both `payments` (`SUCCESS`) and `rentals` (`CONFIRMED`) commit together. If any statement fails, neither occurs. | MySQL undo logs (`innodb_undo_tablespaces`) restore pre-transaction state on `ROLLBACK`. |
| **Consistency (Integrity)** | Foreign keys (`fk_payment_rental`) and valid `ENUM` statuses are preserved. | Constraints and triggers (`trg_payments_after_update`) enforce validity. |
| **Isolation (Concurrency)** | While customer A pays, no other customer or scheduled event can observe partial uncommitted state (no dirty reads). | InnoDB row-level locking (`REPEATABLE READ` isolation level). |
| **Durability (Permanence)** | Once payment confirmation commits, it survives server crashes or sudden power outages. | InnoDB Redo Log (`ib_logfile0`) flushes transaction log to persistent storage before returning success. |

### 4. Native MySQL Stored Procedure with Transaction (`sp_process_payment_transaction`)
Rather than relying on Spring's `@Transactional` annotation in Java, the transaction logic is executed **entirely within MySQL**:

```sql
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
```

### 5. Backend Spring Boot Integration
In `PaymentRepository.java`, Spring calls the MySQL stored procedure directly:
```java
public void callProcessPayment(Long paymentId, String paymentStatus, String transactionReference) {
    jdbcTemplate.update("CALL sp_process_payment_transaction(?, ?, ?)",
            paymentId, paymentStatus, transactionReference);
}
```
All Java `@Transactional` annotations have been removed from `PaymentService.java`. MySQL controls 100% of the transaction lifecycle.

### 6. Interactive MySQL Workbench Script for Defense

```sql
-- 1. SUCCESSFUL TRANSACTION (COMMIT):
START TRANSACTION;

UPDATE payments 
SET payment_status = 'SUCCESS', transaction_reference = 'TXN-12345', paid_at = NOW()
WHERE payment_id = 1;

UPDATE rentals 
SET status = 'CONFIRMED' 
WHERE rental_id = 1;

COMMIT;

-- 2. FAILED TRANSACTION (ROLLBACK):
START TRANSACTION;

UPDATE payments 
SET payment_status = 'SUCCESS', transaction_reference = 'TXN-99999'
WHERE payment_id = 1;

-- Simulate error/abort:
ROLLBACK;

-- Verify payment did NOT change:
SELECT payment_id, payment_status, transaction_reference FROM payments WHERE payment_id = 1;
```

---

## 8. Unique Schema Feature: MySQL 8 Stored Generated Column (`rental_duration_days`)

### 1. What is it?
In the `rentals` table, `rental_duration_days` is a **Stored Generated Column** (also known as a Computed Column):
```sql
ALTER TABLE rentals 
ADD COLUMN rental_duration_days INT 
GENERATED ALWAYS AS (DATEDIFF(end_date, start_date)) STORED;
```

### 2. Why this is Unique (Unlike Functions, Procedures, Triggers, Indexes, Events):
* **It is NOT a Function:** Does not need manual invocation (`SELECT fn(...)`). It behaves like a native table column.
* **It is NOT a Trigger:** Does not require procedural code or write interception.
* **Storage Layer Computation:** The InnoDB storage engine automatically computes and stores the value on disk whenever `start_date` or `end_date` is inserted or modified.
* **Zero Backend Overhead:** Java insert and update queries do not need to calculate duration. MySQL handles it natively.

### 3. Live Workbench Verification
```sql
SELECT rental_id, booking_reference, start_date, end_date, rental_duration_days 
FROM rentals 
LIMIT 5;
```

---

## 9. Key Business Rules & Defenses Implemented

### 1. Maintenance Liability Lock
* **Rule:** If a customer has unpaid maintenance or damage liabilities, new equipment reservations are locked.
* **Frontend Handling:** A red warning banner is displayed across `EquipmentDetail.jsx`, `QuotationPage.jsx`, and `RentalBooking.jsx`.
* **Direct Dashboard Route:** Clicking "View Maintenance Dues on Dashboard" routes directly to `/dashboard` (with an alias `/customer/dashboard` in `AppRouter.jsx`), where the customer sees the outstanding charges and service invoice table.

### 2. 15-Minute Payment Window & Autonomous Expiration
* **Rule:** Once a booking is created, the customer has **15 minutes** to pay.
* **Implementation:** `rentals.payment_deadline` is set via `COALESCE(?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`. The scheduled event `evt_hourly_expire_pending_rentals` automatically expires overdue rentals every 15 minutes.

### 3. Equipment Return & Lifecycle Automation
* **Rule:** When all machines in a rental booking are returned by yard staff (whether in GOOD condition or DAMAGED), the rental lifecycle status automatically transitions to `COMPLETED`.
* **Implementation:** Enforced both inside MySQL procedure `sp_process_return` and verified by `ReturnService.java`.

---

## 10. Master File Index

* **Master Database Script:** [`database/all_5_members_database_objects.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/all_5_members_database_objects.sql)
* **Transaction Script:** [`database/transactions/transaction_rental_payment.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/transactions/transaction_rental_payment.sql)
* **Database Readme:** [`database/README.md`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/README.md)
* **Backend Repository:** [`PaymentRepository.java`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/backend/src/main/java/com/constructionrental/system/payment/repository/PaymentRepository.java)
* **Backend Service:** [`PaymentService.java`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/backend/src/main/java/com/constructionrental/system/payment/service/PaymentService.java)
* **Router:** [`AppRouter.jsx`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/frontend/src/router/AppRouter.jsx)
