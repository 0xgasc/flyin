-- Fix transactions table for admin approval system

-- Add processed_at column
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Add admin_notes column  
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update status constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
  CHECK (status IN ('pending', 'completed', 'failed', 'approved', 'rejected'));

-- Update payment_method constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_payment_method_check 
  CHECK (payment_method IN ('card', 'bank', 'account_balance', 'bank_transfer', 'deposit', 'mobile_payment', 'cryptocurrency'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_processed_at ON transactions(processed_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);