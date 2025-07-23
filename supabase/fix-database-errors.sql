-- Fix database constraint errors
-- Run this SQL in your Supabase SQL editor

-- First, check existing constraint violations and fix them
-- Remove any invalid payment methods in transactions table
UPDATE transactions 
SET payment_method = 'bank_transfer' 
WHERE payment_method NOT IN ('bank_transfer', 'cryptocurrency', 'mobile_money', 'account_balance', 'manual');

-- Now add the missing columns without foreign key constraint first
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS processed_by UUID, -- Change to UUID to match profiles.id
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

-- Create helicopters table for fleet management
CREATE TABLE IF NOT EXISTS helicopters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  year_manufactured INTEGER,
  registration_number TEXT UNIQUE,
  capacity INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  max_range_km INTEGER,
  cruise_speed_kmh INTEGER,
  fuel_capacity_liters DECIMAL(8,2),
  fuel_consumption_lph DECIMAL(6,2),
  total_flight_hours DECIMAL(10,1) DEFAULT 0,
  last_maintenance_date DATE,
  next_maintenance_due DATE,
  maintenance_cycle_hours INTEGER DEFAULT 100,
  insurance_expiry DATE,
  certification_expiry DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired', 'inspection')),
  location TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default helicopters (enhanced with full details)
INSERT INTO helicopters (
  id, name, model, manufacturer, year_manufactured, registration_number, 
  capacity, hourly_rate, max_range_km, cruise_speed_kmh, fuel_capacity_liters, 
  fuel_consumption_lph, location, notes
) VALUES
('robinson-r44', 'Robinson R44 II', 'R44 Raven II', 'Robinson Helicopter Company', 2020, 'TG-ROB44', 3, 600.00, 560, 180, 114.0, 45.0, 'Guatemala City Base', 'Primary training and short-haul helicopter'),
('robinson-r66', 'Robinson R66', 'R66 Turbine', 'Robinson Helicopter Company', 2021, 'TG-ROB66', 4, 800.00, 650, 200, 284.0, 95.0, 'Guatemala City Base', 'Turbine helicopter for executive transport'),
('airbus-h125', 'Airbus H125', 'H125 Ecureuil', 'Airbus Helicopters', 2019, 'TG-AIR25', 5, 1200.00, 790, 220, 540.0, 180.0, 'Flores Base', 'High-performance single-engine helicopter'),
('bell-206', 'Bell 206 LongRanger', 'Bell 206L-4', 'Bell Helicopter', 2018, 'TG-BEL06', 6, 1000.00, 720, 210, 435.0, 140.0, 'Antigua Base', 'Versatile multi-purpose helicopter')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  model = EXCLUDED.model,
  manufacturer = EXCLUDED.manufacturer,
  year_manufactured = EXCLUDED.year_manufactured,
  registration_number = EXCLUDED.registration_number,
  capacity = EXCLUDED.capacity,
  hourly_rate = EXCLUDED.hourly_rate,
  max_range_km = EXCLUDED.max_range_km,
  cruise_speed_kmh = EXCLUDED.cruise_speed_kmh,
  fuel_capacity_liters = EXCLUDED.fuel_capacity_liters,
  fuel_consumption_lph = EXCLUDED.fuel_consumption_lph,
  location = EXCLUDED.location,
  notes = EXCLUDED.notes;

-- Create maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helicopter_id TEXT NOT NULL REFERENCES helicopters(id),
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('scheduled', 'unscheduled', 'inspection', 'repair', 'upgrade')),
  description TEXT NOT NULL,
  performed_by TEXT,
  start_date DATE NOT NULL,
  completion_date DATE,
  flight_hours_at_maintenance DECIMAL(10,1),
  cost DECIMAL(10,2),
  parts_replaced TEXT[],
  next_maintenance_due DATE,
  certification_required BOOLEAN DEFAULT FALSE,
  certification_number TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for processed_by in transactions (now with correct UUID type)
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_processed_by 
FOREIGN KEY (processed_by) REFERENCES profiles(id);

-- Add foreign key constraint for helicopter_id in bookings
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_helicopter 
FOREIGN KEY (helicopter_id) REFERENCES helicopters(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_processed_by ON transactions(processed_by);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_passport ON profiles(passport_number);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_details ON bookings USING GIN(passenger_details);
CREATE INDEX IF NOT EXISTS idx_bookings_addons ON bookings USING GIN(selected_addons);
CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category);
CREATE INDEX IF NOT EXISTS idx_helicopters_status ON helicopters(status);
CREATE INDEX IF NOT EXISTS idx_helicopters_registration ON helicopters(registration_number);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_helicopter ON maintenance_records(helicopter_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);

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

COMMENT ON TABLE helicopters IS 'Fleet management for helicopters including specifications and maintenance tracking';
COMMENT ON TABLE maintenance_records IS 'Detailed maintenance history and scheduling for helicopters';

-- Show updated schema
SELECT 
  table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'transactions', 'bookings', 'addons', 'helicopters', 'maintenance_records')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;