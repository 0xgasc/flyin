-- Fix transactions payment method constraint to allow account_balance payments
-- Run this SQL in your Supabase SQL editor

-- Drop existing payment method check constraint if it exists
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;

-- Add updated payment method check constraint to include account_balance
ALTER TABLE transactions ADD CONSTRAINT transactions_payment_method_check 
CHECK (payment_method IN ('bank_transfer', 'cryptocurrency', 'mobile_money', 'account_balance', 'manual'));

-- Show current constraint to verify
SELECT 
    tc.constraint_name, 
    cc.check_clause
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE 
    tc.table_name = 'transactions' 
    AND tc.constraint_type = 'CHECK'
    AND tc.constraint_name LIKE '%payment_method%';