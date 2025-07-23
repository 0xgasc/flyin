-- Add aircraft table for helicopters and airplanes
CREATE TABLE aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('helicopter', 'airplane')),
  capacity INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE
);

-- Add destinations table with real coordinates
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW'),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  city TEXT NOT NULL,
  region TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('airport', 'helipad', 'tourist_destination', 'private_airstrip')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Add route pricing table
CREATE TABLE route_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  from_destination_id UUID NOT NULL REFERENCES destinations(id),
  to_destination_id UUID NOT NULL REFERENCES destinations(id),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id),
  distance_km INTEGER NOT NULL,
  flight_time_minutes INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  price_per_additional_passenger DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(from_destination_id, to_destination_id, aircraft_id)
);

-- Insert aircraft data based on flyinguate.com
INSERT INTO aircraft (name, model, type, capacity, hourly_rate, description, features) VALUES
-- Helicopters
('Robinson R44 II', 'R44 Raven II', 'helicopter', 3, 1200.00, 'Reliable and cost-effective helicopter for short to medium flights', ARRAY['3 passengers', 'Excellent visibility', 'Cost effective', 'Perfect for tours']),
('Robinson R66', 'R66 Turbine', 'helicopter', 4, 1600.00, 'Turbine-powered reliability with superior performance', ARRAY['4 passengers', 'Turbine engine', 'Enhanced performance', 'Smooth operation']),
('Bell 206 JetRanger', 'Bell 206B-3', 'helicopter', 4, 1800.00, 'Industry standard for professional helicopter operations', ARRAY['4 passengers', 'Proven reliability', 'Professional standard', 'Comfortable cabin']),
('Bell 206 LongRanger', 'Bell 206L-4', 'helicopter', 6, 2200.00, 'Extended range and capacity for larger groups', ARRAY['6 passengers', 'Extended range', 'Spacious cabin', 'Premium comfort']),
('Airbus AS 350', 'AS 350 B3e Ecureuil', 'helicopter', 5, 2400.00, 'High-performance helicopter for challenging destinations', ARRAY['5 passengers', 'High altitude capable', 'Advanced avionics', 'Superior performance']),

-- Airplanes
('Cessna 172 XP', 'Cessna 172XP', 'airplane', 3, 800.00, 'Single-engine aircraft perfect for short regional flights', ARRAY['3 passengers', 'Fuel efficient', 'Reliable', 'Regional flights']),
('Cessna C206 Turbo', 'Cessna 206 Turbo', 'airplane', 5, 1400.00, 'Versatile turbocharged aircraft for varied destinations', ARRAY['5 passengers', 'Turbocharged', 'All-weather capable', 'Cargo capacity']),
('King Air C90', 'Beechcraft King Air C90GTx', 'airplane', 6, 2800.00, 'Twin-turbine luxury for executive travel', ARRAY['6 passengers', 'Twin turbine', 'Executive comfort', 'Weather radar']),
('King Air 300', 'Beechcraft King Air 350i', 'airplane', 9, 3600.00, 'Premium aircraft for larger groups and long distances', ARRAY['9 passengers', 'Long range', 'Premium cabin', 'Advanced avionics']);

-- Insert destinations based on flyinguate.com
INSERT INTO destinations (name, code, city, region, latitude, longitude, type, description) VALUES
-- Main Hub
('La Aurora International Airport', 'GUA', 'Guatemala City', 'Guatemala', 14.5833, -90.5275, 'airport', 'Main international airport and FlyInGuate hub'),

-- Tourist Destinations
('Antigua Guatemala', 'ANTIGUA', 'Antigua', 'Sacatepéquez', 14.5586, -90.7339, 'tourist_destination', 'Colonial city and UNESCO World Heritage Site'),
('Finca San Cayetano', 'FINCA_SC', 'San Cayetano', 'Guatemala', 14.4500, -90.8000, 'private_airstrip', 'Private agricultural estate with landing strip'),
('Lago Atitlán', 'ATITLAN', 'Panajachel', 'Sololá', 14.7406, -91.1581, 'tourist_destination', 'Stunning volcanic lake surrounded by mountains'),
('Marina del Sur', 'MARINA_SUR', 'El Paredón', 'Escuintla', 13.8667, -90.8333, 'helipad', 'Pacific coast marina and surf destination'),
('Panajachel', 'PANAJACHEL', 'Panajachel', 'Sololá', 14.7406, -91.1581, 'tourist_destination', 'Gateway town to Lake Atitlán'),
('Monterrico', 'MONTERRICO', 'Monterrico', 'Santa Rosa', 13.9333, -90.8333, 'tourist_destination', 'Black sand beach and turtle conservation'),

-- Regional Airports and Cities
('Santa Cruz del Quiché', 'QUICHE', 'Santa Cruz del Quiché', 'Quiché', 15.0333, -91.1500, 'helipad', 'Highland town and regional center'),
('Cobán Airport', 'MGCB', 'Cobán', 'Alta Verapaz', 15.4689, -90.4067, 'airport', 'Gateway to cloud forests and coffee regions'),
('Quetzaltenango Airport', 'MGQZ', 'Quetzaltenango', 'Quetzaltenango', 14.8656, -91.5019, 'airport', 'Second largest city, known as Xela'),
('Retalhuleu Airport', 'MGRT', 'Retalhuleu', 'Retalhuleu', 14.5211, -91.6972, 'airport', 'Pacific coast region airport'),
('Huehuetenango Airport', 'MGHT', 'Huehuetenango', 'Huehuetenango', 15.3197, -91.4711, 'airport', 'Western highlands regional airport'),
('Lanquín', 'LANQUIN', 'Lanquín', 'Alta Verapaz', 15.5333, -89.9667, 'helipad', 'Gateway to Semuc Champey natural pools'),
('Chiquimula Airport', 'MGCM', 'Chiquimula', 'Chiquimula', 14.8500, -89.5333, 'airport', 'Eastern region airport'),
('Zacapa Airport', 'MGZA', 'Zacapa', 'Zacapa', 14.9728, -89.5181, 'airport', 'Dry corridor regional airport'),

-- International
('Ilopango Airport', 'MSLP', 'Ilopango', 'El Salvador', 13.7000, -89.1167, 'airport', 'San Salvador international destination'),
('San Pedro Soloma', 'SOLOMA', 'San Pedro Soloma', 'Huehuetenango', 15.8667, -91.4333, 'helipad', 'High altitude mountain destination'),

-- Caribbean Coast
('Lago de Izabal', 'IZABAL', 'El Estor', 'Izabal', 15.5333, -89.3500, 'tourist_destination', 'Largest lake in Guatemala'),
('Puerto Barrios Airport', 'MGPB', 'Puerto Barrios', 'Izabal', 15.7306, -88.5836, 'airport', 'Caribbean coast port city'),

-- Petén Region
('Flores Airport', 'MGFL', 'Flores', 'Petén', 16.9138, -89.8664, 'airport', 'Gateway to Tikal and Mayan ruins');

-- Sample route pricing (helicopter routes based on flyinguate.com pricing)
INSERT INTO route_pricing (from_destination_id, to_destination_id, aircraft_id, distance_km, flight_time_minutes, base_price, price_per_additional_passenger) VALUES

-- Guatemala City to popular destinations (Robinson R44 II)
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'ANTIGUA'), (SELECT id FROM aircraft WHERE name = 'Robinson R44 II'), 45, 25, 699.00, 140.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'ATITLAN'), (SELECT id FROM aircraft WHERE name = 'Robinson R44 II'), 120, 55, 995.00, 199.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'MONTERRICO'), (SELECT id FROM aircraft WHERE name = 'Robinson R44 II'), 85, 40, 850.00, 170.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'MGCB'), (SELECT id FROM aircraft WHERE name = 'Robinson R44 II'), 215, 85, 1650.00, 330.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'MGFL'), (SELECT id FROM aircraft WHERE name = 'Robinson R44 II'), 450, 180, 4375.00, 875.00),

-- Bell 206 JetRanger pricing (premium helicopter)
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'ANTIGUA'), (SELECT id FROM aircraft WHERE name = 'Bell 206 JetRanger'), 45, 25, 899.00, 180.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'ATITLAN'), (SELECT id FROM aircraft WHERE name = 'Bell 206 JetRanger'), 120, 55, 1295.00, 259.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'MGFL'), (SELECT id FROM aircraft WHERE name = 'Bell 206 JetRanger'), 450, 180, 5500.00, 1100.00),

-- Airbus AS 350 (premium helicopter)
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'MGFL'), (SELECT id FROM aircraft WHERE name = 'Airbus AS 350'), 450, 180, 6200.00, 1240.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'ATITLAN'), (SELECT id FROM aircraft WHERE name = 'Airbus AS 350'), 120, 55, 1450.00, 290.00),

-- Airplane routes
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'MGFL'), (SELECT id FROM aircraft WHERE name = 'Cessna C206 Turbo'), 450, 120, 3900.00, 650.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'MSLP'), (SELECT id FROM aircraft WHERE name = 'King Air C90'), 280, 75, 2800.00, 400.00),
((SELECT id FROM destinations WHERE code = 'GUA'), (SELECT id FROM destinations WHERE code = 'MGCB'), (SELECT id FROM aircraft WHERE name = 'Cessna 172 XP'), 215, 90, 945.00, 315.00);

-- Update existing bookings table to reference aircraft
ALTER TABLE bookings ADD COLUMN aircraft_id UUID REFERENCES aircraft(id);

-- Create indexes for better performance
CREATE INDEX idx_destinations_code ON destinations(code);
CREATE INDEX idx_destinations_type ON destinations(type);
CREATE INDEX idx_aircraft_type ON aircraft(type);
CREATE INDEX idx_route_pricing_from_to ON route_pricing(from_destination_id, to_destination_id);

-- Create a view for easy route pricing queries
CREATE OR REPLACE VIEW route_pricing_view AS
SELECT 
  rp.*,
  fd.name as from_destination,
  fd.code as from_code,
  td.name as to_destination,
  td.code as to_code,
  a.name as aircraft_name,
  a.model as aircraft_model,
  a.type as aircraft_type,
  a.capacity as aircraft_capacity
FROM route_pricing rp
JOIN destinations fd ON rp.from_destination_id = fd.id
JOIN destinations td ON rp.to_destination_id = td.id
JOIN aircraft a ON rp.aircraft_id = a.id
WHERE rp.is_active = true AND fd.is_active = true AND td.is_active = true AND a.is_available = true;

-- Function to get route pricing
CREATE OR REPLACE FUNCTION get_route_price(
  from_code TEXT,
  to_code TEXT,
  aircraft_name TEXT,
  passenger_count INTEGER DEFAULT 1
)
RETURNS TABLE(
  base_price DECIMAL,
  additional_passenger_cost DECIMAL,
  total_price DECIMAL,
  distance_km INTEGER,
  flight_time_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rpv.base_price,
    rpv.price_per_additional_passenger * GREATEST(0, passenger_count - 1),
    rpv.base_price + (rpv.price_per_additional_passenger * GREATEST(0, passenger_count - 1)),
    rpv.distance_km,
    rpv.flight_time_minutes
  FROM route_pricing_view rpv
  WHERE rpv.from_code = from_code 
    AND rpv.to_code = to_code 
    AND rpv.aircraft_name = aircraft_name;
END;
$$ LANGUAGE plpgsql;