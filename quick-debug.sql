-- Quick debug queries to run right now

-- 1. See ALL profiles that exist
SELECT 'PROFILES:' as type, id, email, full_name, role, kyc_verified 
FROM profiles 
ORDER BY created_at DESC;

-- 2. See ALL auth users
SELECT 'AUTH USERS:' as type, id, email, email_confirmed_at, created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Check the specific users you mentioned
SELECT 'SPECIFIC USERS:' as type, id, email, full_name, role
FROM profiles 
WHERE email IN ('piloto@flyin.com', 'gasolomonc@gmail.com') 
OR email LIKE '%flyin%'
OR email LIKE '%gasol%';

-- 4. See all bookings and their status
SELECT 'BOOKINGS:' as type, id, status, created_at, client_id
FROM bookings 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check RLS policies (might be blocking the view)
SELECT 'RLS POLICIES:' as type, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';