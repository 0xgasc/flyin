-- Fix helicopters table - add missing columns
-- Run this SQL in your Supabase SQL editor

-- Add missing columns to existing helicopters table
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

-- Add check constraint for status if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE helicopters ADD CONSTRAINT helicopters_status_check 
    CHECK (status IN ('active', 'maintenance', 'retired', 'inspection'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add unique constraint for registration_number if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE helicopters ADD CONSTRAINT helicopters_registration_unique 
    UNIQUE (registration_number);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Update existing helicopters with enhanced details
UPDATE helicopters 
SET 
  manufacturer = CASE 
    WHEN model LIKE '%R44%' OR model LIKE '%R66%' THEN 'Robinson Helicopter Company'
    WHEN model LIKE '%H125%' OR model LIKE '%Airbus%' THEN 'Airbus Helicopters'
    WHEN model LIKE '%Bell%' OR model LIKE '%206%' THEN 'Bell Helicopter'
    ELSE 'Unknown'
  END,
  year_manufactured = 2020,
  registration_number = CASE 
    WHEN id = 'robinson-r44' THEN 'TG-ROB44'
    WHEN id = 'robinson-r66' THEN 'TG-ROB66'
    WHEN id = 'airbus-h125' THEN 'TG-AIR25'
    WHEN id = 'bell-206' THEN 'TG-BEL06'
    ELSE 'TG-' || UPPER(SUBSTRING(id, 1, 5))
  END,
  max_range_km = CASE 
    WHEN id = 'robinson-r44' THEN 560
    WHEN id = 'robinson-r66' THEN 650
    WHEN id = 'airbus-h125' THEN 790
    WHEN id = 'bell-206' THEN 720
    ELSE 500
  END,
  cruise_speed_kmh = CASE 
    WHEN id = 'robinson-r44' THEN 180
    WHEN id = 'robinson-r66' THEN 200
    WHEN id = 'airbus-h125' THEN 220
    WHEN id = 'bell-206' THEN 210
    ELSE 180
  END,
  fuel_capacity_liters = CASE 
    WHEN id = 'robinson-r44' THEN 114.0
    WHEN id = 'robinson-r66' THEN 284.0
    WHEN id = 'airbus-h125' THEN 540.0
    WHEN id = 'bell-206' THEN 435.0
    ELSE 200.0
  END,
  fuel_consumption_lph = CASE 
    WHEN id = 'robinson-r44' THEN 45.0
    WHEN id = 'robinson-r66' THEN 95.0
    WHEN id = 'airbus-h125' THEN 180.0
    WHEN id = 'bell-206' THEN 140.0
    ELSE 50.0
  END,
  total_flight_hours = 245.5,
  last_maintenance_date = '2024-01-15',
  next_maintenance_due = '2024-04-15',
  status = 'active',
  location = CASE 
    WHEN id = 'airbus-h125' THEN 'Flores Base'
    WHEN id = 'bell-206' THEN 'Antigua Base'
    ELSE 'Guatemala City Base'
  END,
  notes = CASE 
    WHEN id = 'robinson-r44' THEN 'Primary training and short-haul helicopter'
    WHEN id = 'robinson-r66' THEN 'Turbine helicopter for executive transport'
    WHEN id = 'airbus-h125' THEN 'High-performance single-engine helicopter'
    WHEN id = 'bell-206' THEN 'Versatile multi-purpose helicopter'
    ELSE 'Standard helicopter'
  END
WHERE manufacturer IS NULL OR manufacturer = '';

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
DO $$ 
BEGIN
    ALTER TABLE transactions 
    ADD CONSTRAINT fk_transactions_processed_by 
    FOREIGN KEY (processed_by) REFERENCES profiles(id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add foreign key constraint for helicopter_id in bookings
DO $$ 
BEGIN
    ALTER TABLE bookings 
    ADD CONSTRAINT fk_bookings_helicopter 
    FOREIGN KEY (helicopter_id) REFERENCES helicopters(id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_helicopters_status ON helicopters(status);
CREATE INDEX IF NOT EXISTS idx_helicopters_registration ON helicopters(registration_number);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_helicopter ON maintenance_records(helicopter_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);

-- Show updated helicopters table structure
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'helicopters'
  AND table_schema = 'public'
ORDER BY ordinal_position;