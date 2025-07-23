-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'pilot', 'admin')),
  phone TEXT,
  account_balance DECIMAL(10,2) DEFAULT 0.00,
  kyc_verified BOOLEAN DEFAULT FALSE
);

-- Create airports table
CREATE TABLE airports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE
);

-- Create experiences table
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  max_passengers INTEGER DEFAULT 4,
  includes TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  client_id UUID NOT NULL REFERENCES profiles(id),
  booking_type TEXT NOT NULL CHECK (booking_type IN ('transport', 'experience')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'assigned', 'completed', 'cancelled')),
  from_location TEXT,
  to_location TEXT,
  experience_id UUID REFERENCES experiences(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  passenger_count INTEGER DEFAULT 1,
  notes TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  pilot_id UUID REFERENCES profiles(id),
  admin_notes TEXT
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  user_id UUID NOT NULL REFERENCES profiles(id),
  booking_id UUID REFERENCES bookings(id),
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'deposit', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank', 'account_balance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference TEXT
);

-- Create indexes
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_pilot_id ON bookings(pilot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = pilot_id);

CREATE POLICY "Clients can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admin can view all bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Experiences policies
CREATE POLICY "Anyone can view active experiences" ON experiences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage experiences" ON experiences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Airports policies
CREATE POLICY "Anyone can view airports" ON airports
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage airports" ON airports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'client');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample airports
INSERT INTO airports (code, name, city, latitude, longitude) VALUES
  ('GUA', 'La Aurora International Airport', 'Guatemala City', 14.5833, -90.5275),
  ('FRS', 'Mundo Maya International Airport', 'Flores', 16.9138, -89.8664),
  ('PBR', 'Puerto Barrios Airport', 'Puerto Barrios', 15.7306, -88.5836),
  ('RER', 'Retalhuleu Airport', 'Retalhuleu', 14.5211, -91.6972);

-- Insert sample experiences
INSERT INTO experiences (name, description, duration_hours, base_price, location, includes) VALUES
  ('Antigua Colonial Tour', 'Aerial views of Antigua Guatemala and surrounding volcanoes', 1.5, 450.00, 'Antigua', ARRAY['Professional pilot', 'Safety briefing', 'Photo opportunities']),
  ('Lake Atitlán Discovery', 'Spectacular views of Lake Atitlán and three volcanoes', 2.0, 650.00, 'Lake Atitlán', ARRAY['Professional pilot', 'Multiple landing spots', 'Refreshments']),
  ('Tikal Ruins Experience', 'Fly over ancient Mayan ruins and tropical rainforest', 3.0, 1200.00, 'Petén', ARRAY['Professional pilot', 'Ground transportation', 'Guided tour', 'Lunch']),
  ('Pacific Coast Sunset', 'Coastal flight with sunset views over the Pacific', 1.0, 350.00, 'Pacific Coast', ARRAY['Professional pilot', 'Champagne service', 'Beach landing']);