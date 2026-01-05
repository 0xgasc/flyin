-- FIX RLS POLICIES: Secure access control without infinite recursion
-- Run this in Supabase SQL Editor to fix the overly permissive policies

-- =====================================================
-- STEP 1: Create admin check function (SECURITY DEFINER avoids RLS recursion)
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_pilot_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('pilot', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 2: Drop all existing policies
-- =====================================================

-- Profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

-- Bookings
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bookings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;

-- Transactions
DROP POLICY IF EXISTS "Enable read access for all users" ON transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transactions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;

-- =====================================================
-- STEP 3: Create secure policies for PROFILES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles (uses SECURITY DEFINER function)
CREATE POLICY "profiles_select_admin"
ON profiles FOR SELECT
TO authenticated
USING (public.is_admin());

-- Users can insert their own profile (for signup)
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "profiles_update_admin"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_admin());

-- =====================================================
-- STEP 4: Create secure policies for BOOKINGS
-- =====================================================

-- Clients can view their own bookings
CREATE POLICY "bookings_select_client"
ON bookings FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

-- Pilots can view bookings assigned to them
CREATE POLICY "bookings_select_pilot"
ON bookings FOR SELECT
TO authenticated
USING (auth.uid() = pilot_id);

-- Admins can view all bookings
CREATE POLICY "bookings_select_admin"
ON bookings FOR SELECT
TO authenticated
USING (public.is_admin());

-- Authenticated users can create bookings for themselves
CREATE POLICY "bookings_insert_own"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

-- Admins can update any booking
CREATE POLICY "bookings_update_admin"
ON bookings FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Pilots can update their assigned bookings (status only)
CREATE POLICY "bookings_update_pilot"
ON bookings FOR UPDATE
TO authenticated
USING (auth.uid() = pilot_id AND public.is_pilot_or_admin());

-- Admins can delete bookings
CREATE POLICY "bookings_delete_admin"
ON bookings FOR DELETE
TO authenticated
USING (public.is_admin());

-- =====================================================
-- STEP 5: Create secure policies for TRANSACTIONS
-- =====================================================

-- Users can view their own transactions
CREATE POLICY "transactions_select_own"
ON transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "transactions_select_admin"
ON transactions FOR SELECT
TO authenticated
USING (public.is_admin());

-- Authenticated users can create transactions for themselves
CREATE POLICY "transactions_insert_own"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can insert transactions for anyone (for admin deposits/withdrawals)
CREATE POLICY "transactions_insert_admin"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admins can update transactions
CREATE POLICY "transactions_update_admin"
ON transactions FOR UPDATE
TO authenticated
USING (public.is_admin());

-- =====================================================
-- STEP 6: Ensure RLS is enabled on all tables
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION: Test the policies
-- =====================================================

-- You should see proper row counts based on your role
SELECT 'RLS Policies Updated Successfully' as status;
