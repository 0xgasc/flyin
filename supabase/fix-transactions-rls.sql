-- Fix Row Level Security for transactions table
-- Run this in your Supabase SQL Editor

-- Allow users to create their own transactions (deposits/top-ups)
CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    type IN ('deposit', 'payment')
  );

-- If the above policy already exists, drop and recreate it
-- DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;

-- Alternative: Allow authenticated users to create transactions
-- This is more permissive but simpler
CREATE POLICY "Authenticated users can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id
  );

-- Verify existing policies
SELECT * FROM pg_policies WHERE tablename = 'transactions';