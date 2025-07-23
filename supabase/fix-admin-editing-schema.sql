-- Fix admin editing schema issues
-- Run this SQL in your Supabase SQL editor

-- Add missing columns to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS processed_by TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add missing columns to profiles table for better admin editing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS passport_number TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS license_expiry DATE,
ADD COLUMN IF NOT EXISTS medical_certificate_expiry DATE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add passenger details and addons to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS passenger_details JSONB,
ADD COLUMN IF NOT EXISTS selected_addons JSONB,
ADD COLUMN IF NOT EXISTS addon_total_price DECIMAL(10,2) DEFAULT 0;

-- Create addons table for managing available services
CREATE TABLE IF NOT EXISTS addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL, -- 'comfort', 'service', 'equipment', 'catering'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert placeholder addons
INSERT INTO addons (id, name, description, price, category) VALUES
('priority-boarding', 'Priority Boarding', 'Skip the queue with priority boarding access', 25.00, 'service'),
('luxury-seating', 'Luxury Seating', 'Upgrade to premium leather seating with extra legroom', 50.00, 'comfort'),
('gourmet-meal', 'Gourmet Meal Service', 'Chef-prepared meal with local Guatemalan specialties', 35.00, 'catering'),
('champagne-service', 'Champagne Service', 'Premium champagne service during flight', 45.00, 'catering'),
('photography-package', 'Aerial Photography Package', 'Professional photos of your journey from the sky', 75.00, 'service'),
('luggage-assistance', 'Premium Luggage Handling', 'White-glove luggage service and assistance', 20.00, 'service'),
('ground-transport', 'Ground Transportation', 'Luxury car service to/from helipad', 60.00, 'service'),
('weather-protection', 'Weather Protection Gear', 'Rain gear and protective equipment', 15.00, 'equipment'),
('binoculars-rental', 'Binoculars Rental', 'High-quality binoculars for sightseeing', 10.00, 'equipment'),
('travel-insurance', 'Travel Insurance', 'Comprehensive flight insurance coverage', 30.00, 'service')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category;

-- Add foreign key for processed_by in transactions
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_processed_by 
FOREIGN KEY (processed_by) REFERENCES profiles(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_processed_by ON transactions(processed_by);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_passport ON profiles(passport_number);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_details ON bookings USING GIN(passenger_details);
CREATE INDEX IF NOT EXISTS idx_bookings_addons ON bookings USING GIN(selected_addons);
CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category);

-- Add comments to explain new columns
COMMENT ON COLUMN transactions.admin_notes IS 'Admin notes for transaction processing';
COMMENT ON COLUMN transactions.processed_by IS 'ID of admin who processed this transaction';
COMMENT ON COLUMN transactions.approved_at IS 'Timestamp when transaction was approved';

COMMENT ON COLUMN profiles.phone IS 'Primary phone number';
COMMENT ON COLUMN profiles.emergency_contact IS 'Emergency contact name';
COMMENT ON COLUMN profiles.emergency_phone IS 'Emergency contact phone';
COMMENT ON COLUMN profiles.passport_number IS 'Passport number for pilots';
COMMENT ON COLUMN profiles.license_number IS 'Pilot license number';
COMMENT ON COLUMN profiles.admin_notes IS 'Admin notes about this user';

COMMENT ON COLUMN bookings.passenger_details IS 'JSON array of passenger information (name, age, etc.)';
COMMENT ON COLUMN bookings.selected_addons IS 'JSON array of selected addon IDs and quantities';
COMMENT ON COLUMN bookings.addon_total_price IS 'Total price of selected addons';

-- Show updated schema
SELECT 
  table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'transactions', 'bookings', 'addons')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;