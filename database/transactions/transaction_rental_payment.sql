-- ============================================================================
-- SIMPLE DATABASE TRANSACTION: PAYMENT & BOOKING CONFIRMATION
-- Construction Equipment Rental System
-- ============================================================================
-- Goal: Update payments to 'SUCCESS' and rentals to 'CONFIRMED' together.
-- If both succeed -> COMMIT (Save permanently)
-- If anything fails -> ROLLBACK (Undo everything)
-- ============================================================================

USE construction_rental;

-- ============================================================================
-- 1. SUCCESSFUL TRANSACTION (COMMIT)
-- ============================================================================

-- Step 1: Start the transaction
START TRANSACTION;

-- Step 2: Update the payment status to SUCCESS
UPDATE payments 
SET payment_status = 'SUCCESS',
    transaction_reference = 'TXN-12345',
    paid_at = NOW()
WHERE payment_id = 1;

-- Step 3: Update the rental booking status to CONFIRMED
UPDATE rentals 
SET status = 'CONFIRMED' 
WHERE rental_id = 1;

-- Step 4: Save all changes permanently
COMMIT;

-- Check the results:
SELECT payment_id, payment_status, transaction_reference FROM payments WHERE payment_id = 1;
SELECT rental_id, status FROM rentals WHERE rental_id = 1;


-- ============================================================================
-- 2. FAILED TRANSACTION (ROLLBACK)
-- ============================================================================

-- Step 1: Start the transaction
START TRANSACTION;

-- Step 2: Try to update the payment
UPDATE payments 
SET payment_status = 'SUCCESS',
    transaction_reference = 'TXN-99999'
WHERE payment_id = 1;

-- Step 3: An error occurred or payment failed, so CANCEL and UNDO everything!
ROLLBACK;

-- Check the results (Notice that payment_status did NOT change! It stayed the same as before):
SELECT payment_id, payment_status, transaction_reference FROM payments WHERE payment_id = 1;


-- ============================================================================
-- OPTIONAL: RESET SCRIPT (To test the above queries again in MySQL Workbench)
-- ============================================================================
-- UPDATE payments SET payment_status = 'PENDING', transaction_reference = NULL, paid_at = NULL WHERE payment_id = 1;
-- UPDATE rentals SET status = 'PENDING_PAYMENT' WHERE rental_id = 1;
