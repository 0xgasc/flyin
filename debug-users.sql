-- Debug why users aren't showing up in admin panel

-- 1. Check all users in profiles table
SELECT id, email, full_name, role, kyc_verified, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- 2. Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Check if admin can see all profiles (run this as admin user)
SELECT count(*) as total_profiles FROM profiles;

-- 4. Check specific users mentioned
SELECT * FROM profiles 
WHERE email IN ('piloto@flyin.com', 'gasolomonc@gmail.com', 'admin@flyinguate.com');

-- 5. If RLS is blocking, temporarily create admin-friendly policy
-- CREATE POLICY "Admins can view all profiles" ON profiles
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles admin_profile 
--       WHERE admin_profile.id = auth.uid() 
--       AND admin_profile.role = 'admin'
--     )
--   );