-- Fix bookings table schema for round trips and missing columns
-- Run this SQL in your Supabase SQL editor

-- Add missing columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS return_date DATE,
ADD COLUMN IF NOT EXISTS return_time TIME,
ADD COLUMN IF NOT EXISTS is_round_trip BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS helicopter_id TEXT,
ADD COLUMN IF NOT EXISTS revision_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS revision_notes TEXT,
ADD COLUMN IF NOT EXISTS revision_data JSONB;

-- Drop existing status check constraint if it exists
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add updated status check constraint to include new statuses
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'approved', 'assigned', 'needs_revision', 'revision_pending', 'completed', 'cancelled'));

-- Drop existing payment_status check constraint if it exists  
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- Add payment status check constraint
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));

-- Add index for helicopter_id for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_helicopter_id ON bookings(helicopter_id);

-- Add index for return_date for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_return_date ON bookings(return_date);

-- Update existing bookings to have proper defaults
UPDATE bookings 
SET 
  is_round_trip = FALSE,
  revision_requested = FALSE
WHERE is_round_trip IS NULL OR revision_requested IS NULL;

-- Add comment to explain the revision system
COMMENT ON COLUMN bookings.revision_requested IS 'TRUE when admin has requested changes to the booking';
COMMENT ON COLUMN bookings.revision_notes IS 'Admin notes explaining what needs to be revised';
COMMENT ON COLUMN bookings.revision_data IS 'JSON object containing proposed changes from admin';

-- Create helicopters reference table if it doesn't exist
CREATE TABLE IF NOT EXISTS helicopters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default helicopters (matching the HELICOPTER_FLEET in your code)
INSERT INTO helicopters (id, name, model, capacity, hourly_rate) VALUES
('robinson-r44', 'Robinson R44 II', 'R44 Raven II', 3, 600.00),
('robinson-r66', 'Robinson R66', 'R66 Turbine', 4, 800.00),
('airbus-h125', 'Airbus H125', 'H125 Ecureuil', 5, 1200.00),
('bell-206', 'Bell 206 LongRanger', 'Bell 206L-4', 6, 1000.00)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  model = EXCLUDED.model,
  capacity = EXCLUDED.capacity,
  hourly_rate = EXCLUDED.hourly_rate;

-- Add foreign key constraint for helicopter_id
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_helicopter 
FOREIGN KEY (helicopter_id) REFERENCES helicopters(id);

-- Show updated schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;