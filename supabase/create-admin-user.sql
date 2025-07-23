-- Create a test admin user for development
-- Username: admin@flyinguate.com
-- Password: admin123

-- IMPORTANT: Only use this for development/testing!

-- First, create the user via Supabase Auth (this needs to be done via the dashboard or API)
-- Then run this SQL to make them admin:

-- Option 1: Update existing user to admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@flyinguate.com';

-- Option 2: Insert admin profile if user exists but profile doesn't
INSERT INTO profiles (id, email, full_name, role, kyc_verified, account_balance)
SELECT 
    id,
    'admin@flyinguate.com',
    'Admin User',
    'admin',
    true,
    0
FROM auth.users 
WHERE email = 'admin@flyinguate.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', 
    full_name = 'Admin User',
    kyc_verified = true;

-- Verify admin was created
SELECT id, email, full_name, role, kyc_verified 
FROM profiles 
WHERE email = 'admin@flyinguate.com';