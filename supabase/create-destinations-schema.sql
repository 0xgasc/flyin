-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  coordinates JSONB, -- {lat: number, lng: number}
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create destination_images table
CREATE TABLE IF NOT EXISTS destination_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0
);

-- Update experiences table to support multiple images
CREATE TABLE IF NOT EXISTS experience_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0
);

-- Add new columns to experiences table if they don't exist
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'helitour',
ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS meeting_point TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_destination_images_destination ON destination_images(destination_id);
CREATE INDEX IF NOT EXISTS idx_experience_images_experience ON experience_images(experience_id);

-- Enable Row Level Security
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_images ENABLE ROW LEVEL SECURITY;

-- Destinations policies
CREATE POLICY "Anyone can view active destinations" ON destinations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage destinations" ON destinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Destination images policies
CREATE POLICY "Anyone can view destination images" ON destination_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM destinations
      WHERE destinations.id = destination_images.destination_id
      AND destinations.is_active = true
    )
  );

CREATE POLICY "Admin can manage destination images" ON destination_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Experience images policies
CREATE POLICY "Anyone can view experience images" ON experience_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = experience_images.experience_id
      AND experiences.is_active = true
    )
  );

CREATE POLICY "Admin can manage experience images" ON experience_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();