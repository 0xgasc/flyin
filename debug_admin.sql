-- Check if admin user exists
SELECT id, email, role, kyc_verified, created_at 
FROM profiles 
WHERE email = 'admin@flyinguate.com';

-- Check all users in auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
WHERE email = 'admin@flyinguate.com';

-- Check all profiles
SELECT email, role, kyc_verified 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;