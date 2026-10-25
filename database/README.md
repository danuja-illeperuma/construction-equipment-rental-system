# Construction Equipment Rental & Management System (CERMS)
## 5-Member Database Architecture & Object Distribution (ICT3222)

This directory contains the authoritative MySQL 8.4 database scripts for CERMS.
The database schema strictly adheres to the 5-member syllabus distribution quota where every member owns their respective database objects:
- **5 Views** (1 per member)
- **5 Scalar Functions** (1 per member)
- **5 Stored Procedures** (1 per member)
- **5 Triggers** (1 per member)
- **5 Custom Composite Indexes** (1 per member)
- **5 Scheduled Events** (1 per member)

All deprecated procedures (`sp_expire_rental`, `sp_create_rental`, `sp_add_rental_item`, `sp_create_payment`, `sp_record_damage`), extra triggers, and extra views have been permanently dropped.

---

## Member-by-Member Breakdown

### Member 1: User & Customer Management Module
- **SQL Script:** [`database/member1_user_customer.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/member1_user_customer.sql)
- **Scope:** Customer Registration, User Accounts, Activation/Deactivation, Customer Audit Logs.
- **Objects:**
  1. **View:** `view_active_customers` — Filtered active customer accounts.
  2. **Function:** `fn_customer_booking_count(p_customer_id)` — Total completed/active bookings for a customer.
  3. **Stored Procedure:** `sp_toggle_customer_active(p_customer_id, p_is_active, OUT p_success, OUT p_message)` — Activates/deactivates customer account with active-rental safety lock.
  4. **Trigger:** `trg_validate_customer_email` — BEFORE INSERT email format & non-empty profile validation.
  5. **Composite Index:** `idx_customers_type_active` ON `customers(is_active, customer_type)` — Accelerates active customer queries by type.
  6. **Scheduled Event:** `evt_daily_customer_count_log` — Nightly 00:00 audit snapshot of active customer volume.

---

### Member 2: Equipment Fleet & Category Management Module
- **SQL Script:** [`database/member2_equipment_fleet.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/member2_equipment_fleet.sql)
- **Scope:** Fleet Inventory, Categories, Pricing Models, Status Lifecycle.
- **Objects:**
  1. **View:** `view_available_equipment` — Active machines currently AVAILABLE for customer booking.
  2. **Function:** `fn_get_equipment_daily_rate(p_equipment_id)` — Fetches calibrated daily rental rate.
  3. **Stored Procedure:** `sp_update_equipment_status(p_equipment_id, p_new_status, OUT p_success)` — Enforces valid fleet status transitions (`AVAILABLE`, `RENTED`, `MAINTENANCE`).
  4. **Trigger:** `trg_validate_equipment_rates` — BEFORE INSERT non-negative rate validation.
  5. **Composite Index:** `idx_equipment_active_status` ON `equipment(is_active, status)` — Accelerates catalog browsing.
  6. **Scheduled Event:** `evt_daily_maintenance_status_check` — Nightly 02:00 auto-flagging of equipment with due maintenance.

---

### Member 3: Rental & Availability Module
- **SQL Script:** [`database/member3_rental_booking.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/member3_rental_booking.sql)
- **Scope:** Rental Line Calculation, Booking Availability, Safe Cancellation, Autonomous Expiration.
- **Objects:**
  1. **View:** `view_active_rentals` — Live confirmed and active rentals joined with customer details.
  2. **Function:** `calculate_rental_amount(p_quantity, p_duration, p_unit_rate)` — Line-item cost calculation ($Q \times D \times R$).
  3. **Stored Procedure:** `sp_cancel_rental(p_rental_id)` — Cancellation of eligible pending or confirmed rentals.
  4. **Trigger:** `trg_rental_items_before_insert` — BEFORE INSERT positive quantity and duration enforcement.
  5. **Composite Index:** `idx_rentals_status_dates` ON `rentals(status, start_date, end_date)` — Range index scan for availability conflict detection.
  6. **Scheduled Event:** `evt_hourly_expire_pending_rentals` — Autonomous event running every 15 minutes to transition unpaid rentals (`NOW() > payment_deadline`) to `EXPIRED`.

---

### Member 4: Payments, Returns & Damage Inspection Module
- **SQL Script:** [`database/member4_payment_returns.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/member4_payment_returns.sql)
- **Scope:** Payment Processing, PayHere Gateway Integration, Equipment Returns, Overdue Penalties.
- **Objects:**
  1. **View:** `view_successful_payments` — Ledger of paid transactions with customer & booking info.
  2. **Function:** `calculate_late_charge(p_rental_item_id, p_returned_at)` — Late penalty computation ($Days \times Rate \times 1.5$).
  3. **Stored Procedures:**
     - `sp_process_return(p_rental_item_id, p_returned_at, p_condition, p_notes, p_recorded_by, OUT p_return_id, OUT p_late_charge)` — Equipment return sign-off, damage routing, and automated rental completion.
     - `sp_process_payment_transaction(p_payment_id, p_payment_status, p_transaction_reference)` — Atomic payment settlement & booking confirmation database transaction.
  4. **Trigger:** `trg_payments_after_update` — AFTER UPDATE automatic rental status transition to `CONFIRMED` upon `SUCCESS`.
  5. **Composite Index:** `idx_payments_status_created` ON `payments(payment_status, created_at)` — Fast finance ledger filtering.
  6. **Scheduled Event:** `evt_daily_revenue_log` — Nightly 23:59 log of daily revenue sum into `audit_logs`.

---

### Member 5: Maintenance Management, Reports & Audit Logs Module
- **SQL Script:** [`database/member5_maintenance_reports.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/member5_maintenance_reports.sql)
- **Scope:** Routine & Breakdown Maintenance, Equipment Service History, Spend Analytics.
- **Objects:**
  1. **View:** `v_equipment_maintenance_summary` — Machine-level maintenance aggregation.
  2. **Function:** `calculate_equipment_maintenance_cost(p_equipment_id, p_start_date, p_end_date)` — Total maintenance expenditure calculation.
  3. **Stored Procedure:** `sp_complete_maintenance(p_maintenance_id, p_actual_cost, OUT p_success)` — Maintenance job completion and machine status restoration.
  4. **Trigger:** `trg_maintenance_records_before_insert` — BEFORE INSERT non-negative maintenance cost check.
  5. **Composite Index:** `idx_maint_equip_status_date` ON `maintenance_records(equipment_id, status, maintenance_date)` — Rapid maintenance history lookup.
  6. **Scheduled Event:** `evt_weekly_maintenance_summary` — Weekly audit log recording total 7-day service costs.

---

## Database Transactions & ACID Demonstration

### System Transaction: Rental Payment & Booking Confirmation
- **SQL Script:** [`database/transactions/transaction_rental_payment.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/transactions/transaction_rental_payment.sql)
- **Business Purpose:** When a customer completes payment for an equipment hire, two tables must be updated atomically:
  1. `payments`: Change `payment_status` to `'SUCCESS'`, record `transaction_reference` and `paid_at`.
  2. `rentals`: Change `status` from `'PENDING_PAYMENT'` to `'CONFIRMED'`.
  3. `audit_logs`: Record an immutable financial audit trail.
- **Why a Transaction is Required (The Business Risk):**
  - Without a transaction, if the payment is recorded as `SUCCESS` but a crash occurs before the rental is marked `CONFIRMED`, the customer was charged, but their rental will be automatically cancelled or expired by `evt_hourly_expire_pending_rentals`!
  - If the booking is marked `CONFIRMED` but payment fails, the business loses revenue.
- **ACID Properties:**
  - **Atomicity:** Both `payments` and `rentals` are committed together (`COMMIT`) or both rolled back (`ROLLBACK`).
  - **Consistency:** Foreign key integrity (`fk_payment_rental`) and valid status transitions are preserved.
  - **Isolation:** Changes remain uncommitted and invisible to concurrent queries until `COMMIT` occurs (preventing dirty reads).
  - **Durability:** Once committed, records are persisted to InnoDB redo logs and disk, surviving power outages.
- **Application Mapping:** Handled natively in MySQL via stored procedure `sp_process_payment_transaction` and called directly by `PaymentRepository.java`.

---

## Unique Database Schema Feature (MySQL 8)
- **Feature:** Stored Generated (Computed) Column `rental_duration_days` on `rentals`.
- **Definition:** `rental_duration_days INT GENERATED ALWAYS AS (DATEDIFF(end_date, start_date)) STORED`
- **Purpose:** Automatically calculates and persists rental duration in days at the InnoDB storage layer whenever dates are inserted or updated, eliminating procedural trigger overhead.

---

## Production Database Schema & Master Installation
- **Latest Production Schema DDL (All 12 Tables):** [`database/schema/latest_schema.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/schema/latest_schema.sql)
- **Unified Master Objects Script (Views, Functions, Procedures, Triggers, Indexes, Events):** [`database/all_5_members_database_objects.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/all_5_members_database_objects.sql)
- **Transaction Script:** [`database/transactions/transaction_rental_payment.sql`](file:///d:/construction-equipment-rental-system/construction-equipment-rental-system/database/transactions/transaction_rental_payment.sql)
