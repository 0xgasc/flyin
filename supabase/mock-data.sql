-- Insert mock airports (in addition to the ones in schema.sql)
INSERT INTO airports (code, name, city, latitude, longitude, is_custom) VALUES
  ('MGGT', 'La Aurora International Airport', 'Guatemala City', 14.5833, -90.5275, false),
  ('MGCB', 'Coban Airport', 'Coban', 15.4689, -90.4067, false),
  ('MGQZ', 'Quetzaltenango Airport', 'Quetzaltenango', 14.8656, -91.5019, false),
  ('CUSTOM001', 'Antigua Helipad', 'Antigua', 14.5586, -90.7339, true),
  ('CUSTOM002', 'Lake Atitlan Landing', 'Panajachel', 14.7406, -91.1581, true),
  ('CUSTOM003', 'Tikal Airstrip', 'Tikal', 17.2222, -89.6228, true),
  ('CUSTOM004', 'Semuc Champey Landing', 'Lanquin', 15.5333, -89.9667, true);

-- Insert mock experiences (additional to schema.sql)
INSERT INTO experiences (name, description, duration_hours, base_price, max_passengers, includes, location, is_active) VALUES
  ('Volcano Adventure Tour', 'Fly over active Fuego volcano and see lava flows up close', 2.5, 850.00, 4, ARRAY['Professional pilot', 'Safety equipment', 'Volcano guide', 'Photos included'], 'Antigua', true),
  ('Pacific Sunset Flight', 'Romantic sunset flight along Guatemala''s Pacific coastline', 1.5, 550.00, 2, ARRAY['Professional pilot', 'Champagne service', 'Beach landing', 'Sunset timing'], 'Pacific Coast', true),
  ('Mayan Heritage Explorer', 'Comprehensive tour of Tikal ruins and surrounding jungle', 4.0, 1500.00, 6, ARRAY['Professional pilot', 'Ground transportation', 'Archaeological guide', 'Lunch', 'Park entry'], 'Petén', true),
  ('Coffee Plantation Tour', 'Visit highland coffee farms with aerial views of plantations', 2.0, 650.00, 4, ARRAY['Professional pilot', 'Farm tour', 'Coffee tasting', 'Local guide'], 'Huehuetenango', true),
  ('Semuc Champey Adventure', 'Natural pools and limestone bridges from the air', 3.0, 950.00, 4, ARRAY['Professional pilot', 'Ground transport', 'Swimming time', 'Local guide', 'Lunch'], 'Alta Verapaz', true);

-- Create mock users (these would normally be created through auth.users, but for demo purposes)
-- Note: In a real app, these would be inserted via Supabase Auth signup

-- Mock Clients
INSERT INTO profiles (id, email, full_name, role, phone, account_balance, kyc_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'carlos.rodriguez@email.com', 'Carlos Rodriguez', 'client', '+502 5555 0101', 1200.00, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'ana.martinez@email.com', 'Ana Martinez', 'client', '+502 5555 0102', 800.00, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'john.smith@email.com', 'John Smith', 'client', '+1 555 123 4567', 2500.00, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'maria.garcia@email.com', 'Maria Garcia', 'client', '+502 5555 0104', 450.00, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'david.thompson@email.com', 'David Thompson', 'client', '+1 555 987 6543', 1800.00, true);

-- Mock Pilots
INSERT INTO profiles (id, email, full_name, role, phone, account_balance, kyc_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'miguel.santos@flyinguate.com', 'Miguel Santos', 'pilot', '+502 5555 1001', 0.00, true),
  ('550e8400-e29b-41d4-a716-446655440012', 'roberto.diaz@flyinguate.com', 'Roberto Diaz', 'pilot', '+502 5555 1002', 0.00, true),
  ('550e8400-e29b-41d4-a716-446655440013', 'luis.morales@flyinguate.com', 'Luis Morales', 'pilot', '+502 5555 1003', 0.00, false),
  ('550e8400-e29b-41d4-a716-446655440014', 'sofia.hernandez@flyinguate.com', 'Sofia Hernandez', 'pilot', '+502 5555 1004', 0.00, true),
  ('550e8400-e29b-41d4-a716-446655440015', 'carlos.mendez@flyinguate.com', 'Carlos Mendez', 'pilot', '+502 5555 1005', 0.00, false);

-- Mock Admin
INSERT INTO profiles (id, email, full_name, role, phone, account_balance, kyc_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'admin@flyinguate.com', 'Admin User', 'admin', '+502 5555 9999', 0.00, true);

-- Mock Bookings with various statuses
INSERT INTO bookings (id, client_id, booking_type, status, from_location, to_location, experience_id, scheduled_date, scheduled_time, passenger_count, notes, total_price, payment_status, pilot_id, admin_notes) VALUES
  ('booking-001', '550e8400-e29b-41d4-a716-446655440001', 'transport', 'pending', 'MGGT', 'MGCB', NULL, '2024-02-15', '09:00', 2, 'Business meeting in Coban', 380.00, 'pending', NULL, NULL),
  
  ('booking-002', '550e8400-e29b-41d4-a716-446655440002', 'experience', 'approved', NULL, NULL, (SELECT id FROM experiences WHERE name = 'Lake Atitlán Discovery'), '2024-02-16', '14:00', 2, 'Anniversary celebration', 1300.00, 'paid', NULL, 'VIP service requested'),
  
  ('booking-003', '550e8400-e29b-41d4-a716-446655440003', 'transport', 'assigned', 'MGGT', 'CUSTOM003', NULL, '2024-02-17', '08:30', 4, 'Tourist group to Tikal', 650.00, 'paid', '550e8400-e29b-41d4-a716-446655440011', 'Confirmed with pilot Miguel'),
  
  ('booking-004', '550e8400-e29b-41d4-a716-446655440004', 'experience', 'assigned', NULL, NULL, (SELECT id FROM experiences WHERE name = 'Antigua Colonial Tour'), '2024-02-18', '10:00', 3, 'Family sightseeing', 1350.00, 'paid', '550e8400-e29b-41d4-a716-446655440012', NULL),
  
  ('booking-005', '550e8400-e29b-41d4-a716-446655440005', 'experience', 'completed', NULL, NULL, (SELECT id FROM experiences WHERE name = 'Volcano Adventure Tour'), '2024-02-10', '15:30', 2, 'Photographer couple', 1700.00, 'paid', '550e8400-e29b-41d4-a716-446655440011', 'Excellent service provided'),
  
  ('booking-006', '550e8400-e29b-41d4-a716-446655440001', 'transport', 'completed', 'CUSTOM001', 'MGGT', NULL, '2024-02-12', '16:45', 1, 'Return from Antigua', 220.00, 'paid', '550e8400-e29b-41d4-a716-446655440012', NULL),
  
  ('booking-007', '550e8400-e29b-41d4-a716-446655440003', 'experience', 'pending', NULL, NULL, (SELECT id FROM experiences WHERE name = 'Pacific Sunset Flight'), '2024-02-20', '17:00', 2, 'Romantic evening flight', 1100.00, 'pending', NULL, NULL),
  
  ('booking-008', '550e8400-e29b-41d4-a716-446655440002', 'transport', 'cancelled', 'MGGT', 'MGQZ', NULL, '2024-02-14', '12:00', 3, 'Changed plans', 420.00, 'refunded', NULL, 'Client cancelled - weather concerns');

-- Mock Transactions
INSERT INTO transactions (user_id, booking_id, type, amount, payment_method, status, reference) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'booking-006', 'payment', 220.00, 'card', 'completed', 'ch_1234567890'),
  ('550e8400-e29b-41d4-a716-446655440002', 'booking-002', 'payment', 1300.00, 'card', 'completed', 'ch_1234567891'),
  ('550e8400-e29b-41d4-a716-446655440003', 'booking-003', 'payment', 650.00, 'account_balance', 'completed', 'bal_1234567892'),
  ('550e8400-e29b-41d4-a716-446655440004', 'booking-004', 'payment', 1350.00, 'bank', 'completed', 'bank_1234567893'),
  ('550e8400-e29b-41d4-a716-446655440005', 'booking-005', 'payment', 1700.00, 'card', 'completed', 'ch_1234567894'),
  ('550e8400-e29b-41d4-a716-446655440002', 'booking-008', 'refund', 420.00, 'card', 'completed', 'rf_1234567895'),
  ('550e8400-e29b-41d4-a716-446655440001', NULL, 'deposit', 500.00, 'bank', 'completed', 'dep_1234567896'),
  ('550e8400-e29b-41d4-a716-446655440003', NULL, 'deposit', 1000.00, 'card', 'completed', 'dep_1234567897');

-- Update some user account balances based on transactions
UPDATE profiles SET account_balance = 1200.00 WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE profiles SET account_balance = 800.00 WHERE id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE profiles SET account_balance = 1150.00 WHERE id = '550e8400-e29b-41d4-a716-446655440003'; -- 2500 - 650 - 1000 + 300 remaining

-- Add some additional sample data for variety
INSERT INTO bookings (id, client_id, booking_type, status, from_location, to_location, experience_id, scheduled_date, scheduled_time, passenger_count, notes, total_price, payment_status, pilot_id, admin_notes) VALUES
  ('booking-009', '550e8400-e29b-41d4-a716-446655440004', 'transport', 'approved', 'CUSTOM002', 'MGGT', NULL, '2024-02-22', '11:30', 2, 'Lake Atitlan pickup', 340.00, 'paid', NULL, 'Ready for pilot assignment'),
  
  ('booking-010', '550e8400-e29b-41d4-a716-446655440005', 'experience', 'assigned', NULL, NULL, (SELECT id FROM experiences WHERE name = 'Mayan Heritage Explorer'), '2024-02-25', '07:00', 4, 'Archaeological enthusiasts', 6000.00, 'paid', '550e8400-e29b-41d4-a716-446655440014', 'Full day tour - Sofia assigned');

-- Create a view for easier data access (optional)
CREATE OR REPLACE VIEW booking_details AS
SELECT 
  b.*,
  c.full_name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  p.full_name as pilot_name,
  p.email as pilot_email,
  e.name as experience_name,
  e.location as experience_location,
  e.duration_hours
FROM bookings b
JOIN profiles c ON b.client_id = c.id
LEFT JOIN profiles p ON b.pilot_id = p.id
LEFT JOIN experiences e ON b.experience_id = e.id;

-- Insert a few more varied bookings for testing different scenarios
INSERT INTO bookings (client_id, booking_type, status, from_location, to_location, scheduled_date, scheduled_time, passenger_count, notes, total_price, payment_status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'transport', 'pending', 'CUSTOM004', 'MGGT', '2024-03-01', '13:15', 1, 'Semuc Champey return trip', 280.00, 'pending'),
  ('550e8400-e29b-41d4-a716-446655440003', 'experience', 'pending', NULL, NULL, (SELECT id FROM experiences WHERE name = 'Coffee Plantation Tour'), '2024-03-05', '09:45', 3, 'Coffee enthusiast group', 1950.00, 'pending');