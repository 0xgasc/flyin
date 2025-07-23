-- Create admin functions to bypass RLS

-- Function to get all profiles (admin only)
CREATE OR REPLACE FUNCTION get_all_profiles_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  kyc_verified BOOLEAN,
  account_balance DECIMAL,
  phone TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Return all profiles
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.role, p.kyc_verified, 
         p.account_balance, p.phone, p.created_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to get all bookings (admin only)
CREATE OR REPLACE FUNCTION get_all_bookings_admin()
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  booking_type TEXT,
  status TEXT,
  from_location TEXT,
  to_location TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  passenger_count INTEGER,
  total_price DECIMAL,
  payment_status TEXT,
  client_id UUID,
  pilot_id UUID,
  notes TEXT,
  admin_notes TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Return all bookings
  RETURN QUERY
  SELECT b.id, b.created_at, b.booking_type, b.status, b.from_location,
         b.to_location, b.scheduled_date, b.scheduled_time, b.passenger_count,
         b.total_price, b.payment_status, b.client_id, b.pilot_id,
         b.notes, b.admin_notes
  FROM bookings b
  ORDER BY b.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_all_profiles_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_bookings_admin() TO authenticated;