-- Add helicopter_id column to bookings table

-- Add the column
ALTER TABLE bookings 
ADD COLUMN helicopter_id TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN bookings.helicopter_id IS 'ID of the assigned helicopter from HELICOPTER_FLEET';

-- Check existing bookings table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;