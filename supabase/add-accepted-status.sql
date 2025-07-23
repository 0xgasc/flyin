-- Add 'accepted' status to bookings workflow
-- This allows pilots to accept missions before marking them as completed

-- First, let's see what statuses currently exist
-- SELECT DISTINCT status FROM bookings;

-- Update any invalid statuses to valid ones before applying constraint
UPDATE bookings SET status = 'pending' WHERE status NOT IN ('pending', 'approved', 'assigned', 'completed', 'cancelled');

-- Update booking status constraint to include 'accepted'
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'approved', 'assigned', 'accepted', 'completed', 'cancelled'));