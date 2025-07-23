-- Fix the payment method constraint to allow the values we're using
-- First, let's see what constraint exists
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'transactions'::regclass 
AND contype = 'c';

-- Drop the existing constraint if it's too restrictive
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;

-- Add a new constraint with the correct values
ALTER TABLE transactions ADD CONSTRAINT transactions_payment_method_check 
CHECK (payment_method IN ('bank_transfer', 'deposit', 'mobile_payment', 'credit_card', 'cash'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'transactions'::regclass 
AND contype = 'c';