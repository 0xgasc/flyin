-- Fix admin access to all data

-- 1. First, let's see what policies exist
SELECT tablename, policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'bookings') 
ORDER BY tablename, policyname;

-- 2. Create admin-friendly policies for profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 3. Create admin-friendly policies for bookings  
DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;
CREATE POLICY "Admin can manage all bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Verify the admin user exists and has correct role
SELECT id, email, role FROM profiles WHERE email = 'admin@flyinguate.com';

-- 5. Test admin access (run this after the policies are created)
-- SELECT count(*) FROM profiles; -- Should show all users now
-- SELECT count(*) FROM bookings; -- Should show all bookings now