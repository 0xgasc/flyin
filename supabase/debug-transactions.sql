-- Debug transactions table and policies
-- Run this in your Supabase SQL Editor

-- Check current policies on transactions table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'transactions';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'transactions';

-- Try to manually test the insert (replace the UUID with your actual user ID)
-- First, get your user ID:
SELECT auth.uid() as current_user_id;

-- Check if you can see your profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Add the missing INSERT policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' 
        AND policyname = 'Users can create own transactions'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id)';
        RAISE NOTICE 'Policy created successfully';
    ELSE
        RAISE NOTICE 'Policy already exists';
    END IF;
END
$$;