-- Create admin profile for the user that was just created
-- Replace 'd1fbb18a-97c9-4adb-b91c-18c9ee134792' with the actual user ID from the console

-- First, let's see what users exist in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'admin@flyinguate.com';

-- Create the admin profile (bypassing RLS by using SQL directly)
INSERT INTO profiles (id, email, full_name, role, kyc_verified, account_balance, created_at)
SELECT 
    id,
    'admin@flyinguate.com',
    'Admin User',
    'admin',
    true,
    0,
    now()
FROM auth.users 
WHERE email = 'admin@flyinguate.com'
ON CONFLICT (id) DO UPDATE 
SET 
    role = 'admin',
    full_name = 'Admin User',
    kyc_verified = true;

-- Verify the admin profile was created
SELECT id, email, full_name, role, kyc_verified 
FROM profiles 
WHERE email = 'admin@flyinguate.com';