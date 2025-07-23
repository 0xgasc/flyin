-- Add helicopter_id column to bookings table
ALTER TABLE bookings ADD COLUMN helicopter_id UUID REFERENCES helicopters(id);

-- Create index for helicopter_id
CREATE INDEX idx_bookings_helicopter_id ON bookings(helicopter_id);

-- Allow admins to update helicopter assignments
CREATE POLICY "Admin can update bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );