-- Fix all tables step by step
-- Run this SQL in your Supabase SQL editor

-- STEP 1: Fix transactions table first
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS processed_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- STEP 2: Fix profiles table
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

-- STEP 3: Fix bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS passenger_details JSONB,
ADD COLUMN IF NOT EXISTS selected_addons JSONB,
ADD COLUMN IF NOT EXISTS addon_total_price DECIMAL(10,2) DEFAULT 0;

-- STEP 4: Fix helicopters table - add missing columns
ALTER TABLE helicopters 
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS year_manufactured INTEGER,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS max_range_km INTEGER,
ADD COLUMN IF NOT EXISTS cruise_speed_kmh INTEGER,
ADD COLUMN IF NOT EXISTS fuel_capacity_liters DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS fuel_consumption_lph DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS total_flight_hours DECIMAL(10,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_maintenance_date DATE,
ADD COLUMN IF NOT EXISTS next_maintenance_due DATE,
ADD COLUMN IF NOT EXISTS maintenance_cycle_hours INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
ADD COLUMN IF NOT EXISTS certification_expiry DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 5: Create addons table if it doesn't exist
CREATE TABLE IF NOT EXISTS addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Insert sample addons (only if they don't exist)
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
ON CONFLICT (id) DO NOTHING;

-- STEP 7: Create maintenance records table
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

-- STEP 8: Update existing helicopters with details
UPDATE helicopters 
SET 
  manufacturer = COALESCE(manufacturer, CASE 
    WHEN model LIKE '%R44%' OR model LIKE '%R66%' THEN 'Robinson Helicopter Company'
    WHEN model LIKE '%H125%' OR model LIKE '%Airbus%' THEN 'Airbus Helicopters'
    WHEN model LIKE '%Bell%' OR model LIKE '%206%' THEN 'Bell Helicopter'
    ELSE 'Unknown'
  END),
  year_manufactured = COALESCE(year_manufactured, 2020),
  registration_number = COALESCE(registration_number, CASE 
    WHEN id = 'robinson-r44' THEN 'TG-ROB44'
    WHEN id = 'robinson-r66' THEN 'TG-ROB66'
    WHEN id = 'airbus-h125' THEN 'TG-AIR25'
    WHEN id = 'bell-206' THEN 'TG-BEL06'
    ELSE 'TG-' || UPPER(SUBSTRING(id, 1, 5))
  END),
  max_range_km = COALESCE(max_range_km, CASE 
    WHEN id = 'robinson-r44' THEN 560
    WHEN id = 'robinson-r66' THEN 650
    WHEN id = 'airbus-h125' THEN 790
    WHEN id = 'bell-206' THEN 720
    ELSE 500
  END),
  cruise_speed_kmh = COALESCE(cruise_speed_kmh, CASE 
    WHEN id = 'robinson-r44' THEN 180
    WHEN id = 'robinson-r66' THEN 200
    WHEN id = 'airbus-h125' THEN 220
    WHEN id = 'bell-206' THEN 210
    ELSE 180
  END),
  fuel_capacity_liters = COALESCE(fuel_capacity_liters, CASE 
    WHEN id = 'robinson-r44' THEN 114.0
    WHEN id = 'robinson-r66' THEN 284.0
    WHEN id = 'airbus-h125' THEN 540.0
    WHEN id = 'bell-206' THEN 435.0
    ELSE 200.0
  END),
  status = COALESCE(status, 'active'),
  location = COALESCE(location, 'Guatemala City Base');

-- STEP 9: Add constraints safely
DO $$ 
BEGIN
    ALTER TABLE helicopters ADD CONSTRAINT helicopters_status_check 
    CHECK (status IN ('active', 'maintenance', 'retired', 'inspection'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- STEP 10: Add foreign key for transactions
DO $$ 
BEGIN
    ALTER TABLE transactions 
    ADD CONSTRAINT fk_transactions_processed_by 
    FOREIGN KEY (processed_by) REFERENCES profiles(id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_column THEN NULL;
END $$;

-- STEP 11: Add foreign key for bookings
DO $$ 
BEGIN
    ALTER TABLE bookings 
    ADD CONSTRAINT fk_bookings_helicopter 
    FOREIGN KEY (helicopter_id) REFERENCES helicopters(id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_column THEN NULL;
END $$;

-- STEP 12: Show what we have now
SELECT 'Helicopters Table' as table_info, COUNT(*) as record_count FROM helicopters
UNION ALL
SELECT 'Addons Table', COUNT(*) FROM addons
UNION ALL
SELECT 'Maintenance Records', COUNT(*) FROM maintenance_records;