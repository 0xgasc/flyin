-- Fix RLS policies for helicopters table
-- This allows all authenticated users to read helicopters
-- Only admins can insert, update, or delete

-- First check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'helicopters';

-- Enable RLS on helicopters table
ALTER TABLE helicopters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view helicopters" ON helicopters;
DROP POLICY IF EXISTS "Admins can manage helicopters" ON helicopters;

-- Create read policy for all authenticated users
CREATE POLICY "Anyone can view helicopters" ON helicopters
    FOR SELECT
    TO authenticated
    USING (true);

-- Create insert/update/delete policy for admins only
CREATE POLICY "Admins can manage helicopters" ON helicopters
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Also check maintenance_records table
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view maintenance records" ON maintenance_records;
DROP POLICY IF EXISTS "Admins can manage maintenance records" ON maintenance_records;

-- Create policies for maintenance_records
CREATE POLICY "Anyone can view maintenance records" ON maintenance_records
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage maintenance records" ON maintenance_records
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Verify helicopters exist
SELECT id, name, model, registration_number, status FROM helicopters;