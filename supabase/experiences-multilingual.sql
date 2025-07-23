-- Add multilingual support to existing tables
ALTER TABLE experiences ADD COLUMN name_es TEXT;
ALTER TABLE experiences ADD COLUMN description_es TEXT;
ALTER TABLE experiences ADD COLUMN includes_es TEXT[] DEFAULT '{}';

-- Update existing experiences table structure
ALTER TABLE experiences ADD COLUMN duration_minutes INTEGER;
ALTER TABLE experiences ADD COLUMN min_passengers INTEGER DEFAULT 1;
ALTER TABLE experiences ADD COLUMN aircraft_options JSONB DEFAULT '[]';
ALTER TABLE experiences ADD COLUMN route_waypoints TEXT[] DEFAULT '{}';
ALTER TABLE experiences ADD COLUMN category TEXT DEFAULT 'scenic';
ALTER TABLE experiences ADD COLUMN difficulty_level TEXT DEFAULT 'easy';
ALTER TABLE experiences ADD COLUMN best_time_of_day TEXT;

-- Create experience categories
CREATE TABLE experience_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Insert experience categories
INSERT INTO experience_categories (name_en, name_es, description_en, description_es, icon, sort_order) VALUES
('Scenic Tours', 'Tours Panorámicos', 'Breathtaking aerial views of Guatemala''s landscapes', 'Vistas aéreas impresionantes de los paisajes de Guatemala', '🏔️', 1),
('Romantic Experiences', 'Experiencias Románticas', 'Special moments for couples in the sky', 'Momentos especiales para parejas en el cielo', '💕', 2),
('Adventure Packages', 'Paquetes de Aventura', 'Exciting helicopter adventures to remote locations', 'Emocionantes aventuras en helicóptero a lugares remotos', '🚁', 3),
('Cultural Tours', 'Tours Culturales', 'Discover Guatemala''s rich heritage from above', 'Descubre el rico patrimonio de Guatemala desde las alturas', '🏛️', 4),
('Beach & Coast', 'Playa y Costa', 'Pacific coast and beach destinations', 'Costa del Pacífico y destinos de playa', '🏖️', 5),
('Volcano Tours', 'Tours de Volcanes', 'Close-up views of Guatemala''s active volcanoes', 'Vistas cercanas de los volcanes activos de Guatemala', '🌋', 6);

-- Add category reference to experiences
ALTER TABLE experiences ADD COLUMN category_id UUID REFERENCES experience_categories(id);

-- Insert real FlyInGuate experiences
INSERT INTO experiences (
  name, name_es, description, description_es, duration_hours, duration_minutes, 
  base_price, max_passengers, min_passengers, includes, includes_es, location,
  aircraft_options, route_waypoints, category, is_active
) VALUES 

-- Scenic Tours
(
  'Heli-Tour Ciudad, Antigua & Laguna Calderas',
  'Heli-Tour Ciudad, Antigua y Laguna Calderas',
  'Panoramic tour of Guatemala City, colonial Antigua, Pacaya Volcano, and Amatitlán Lake in 35 unforgettable minutes',
  'Tour panorámico de Ciudad de Guatemala, la colonial Antigua, volcán Pacaya y lago de Amatitlán en 35 minutos inolvidables',
  0.58, 35,
  479.00, 3, 2,
  ARRAY['Professional pilot', 'Aerial photography', 'Safety briefing', 'Stunning views'],
  ARRAY['Piloto profesional', 'Fotografía aérea', 'Briefing de seguridad', 'Vistas impresionantes'],
  'Guatemala City - Antigua',
  '[{"aircraft": "Robinson R44 II", "capacity": 3, "price": 479}]'::jsonb,
  ARRAY['Guatemala City', 'Antigua Guatemala', 'Pacaya Volcano', 'Lake Amatitlán'],
  'scenic', true
),

(
  'Panoramic Overflight - 45 min',
  'Sobrevuelo Panorámico - 45 min',
  'Extended panoramic tour featuring Guatemala City, Antigua, surrounding volcanoes, and pristine lakes',
  'Tour panorámico extendido que incluye Ciudad de Guatemala, Antigua, volcanes circundantes y lagos prístinos',
  0.75, 45,
  745.00, 4, 2,
  ARRAY['Professional pilot', 'Extended route', 'Multiple aircraft options', 'Scenic photography stops'],
  ARRAY['Piloto profesional', 'Ruta extendida', 'Múltiples opciones de aeronave', 'Paradas fotográficas panorámicas'],
  'Guatemala City - Antigua - Volcanoes',
  '[{"aircraft": "Robinson R44 II", "capacity": 3, "price": 745}, {"aircraft": "Robinson R66", "capacity": 4, "price": 979}]'::jsonb,
  ARRAY['Guatemala City', 'Antigua Guatemala', 'Agua Volcano', 'Fuego Volcano', 'Acatenango Volcano'],
  'scenic', true
),

(
  'Extended Overflight - 60 min',
  'Sobrevuelo Extendido - 60 min',
  'Comprehensive aerial tour covering multiple landmarks, volcanoes, and breathtaking landscapes of Guatemala',
  'Tour aéreo integral que cubre múltiples monumentos, volcanes y paisajes impresionantes de Guatemala',
  1.0, 60,
  899.00, 5, 2,
  ARRAY['Professional pilot', 'Comprehensive route', 'Premium aircraft options', 'Extended photo opportunities'],
  ARRAY['Piloto profesional', 'Ruta integral', 'Opciones de aeronave premium', 'Oportunidades fotográficas extendidas'],
  'Multi-destination tour',
  '[{"aircraft": "Robinson R44 II", "capacity": 2, "price": 899}, {"aircraft": "Robinson R66", "capacity": 4, "price": 1199}, {"aircraft": "Airbus H125", "capacity": 5, "price": 1799}]'::jsonb,
  ARRAY['Guatemala City', 'Antigua', 'Lake Amatitlán', 'Pacaya Volcano', 'Agua Volcano'],
  'scenic', true
),

-- Romantic Experiences
(
  'Romantic Heli-Tour',
  'Heli-Tour Romántico',
  'Special romantic helicopter experience with flowers, champagne, and photography time for unforgettable moments',
  'Experiencia romántica especial en helicóptero con flores, champán y tiempo para fotografías en momentos inolvidables',
  0.58, 35,
  525.00, 2, 2,
  ARRAY['Professional pilot', 'Fresh flowers', 'Champagne service', 'Professional photography', 'Romantic setup'],
  ARRAY['Piloto profesional', 'Flores frescas', 'Servicio de champán', 'Fotografía profesional', 'Ambiente romántico'],
  'Romantic scenic route',
  '[{"aircraft": "Robinson R44 II", "capacity": 2, "price": 525}]'::jsonb,
  ARRAY['Romantic viewpoints', 'Sunset locations', 'Private moments'],
  'romantic', true
),

-- Adventure Packages
(
  'Antigua Guatemala / Tenedor del Cerro',
  'Antigua Guatemala / Tenedor del Cerro',
  'Round trip helicopter flight to historic Antigua with lunch and exploration time in the colonial city',
  'Vuelo de ida y vuelta en helicóptero a la histórica Antigua con almuerzo y tiempo de exploración en la ciudad colonial',
  3.0, 180,
  999.00, 5, 2,
  ARRAY['Round trip flight', 'Lunch included', 'Antigua exploration time', 'Professional guide', 'Historical sites'],
  ARRAY['Vuelo de ida y vuelta', 'Almuerzo incluido', 'Tiempo de exploración en Antigua', 'Guía profesional', 'Sitios históricos'],
  'Antigua Guatemala',
  '[{"aircraft": "Robinson R44 II", "capacity": 2, "price": 999}, {"aircraft": "Robinson R66", "capacity": 4, "price": 1399}, {"aircraft": "Airbus H125", "capacity": 5, "price": 1999}]'::jsonb,
  ARRAY['Guatemala City', 'Antigua Guatemala', 'Tenedor del Cerro'],
  'cultural', true
),

(
  'Four Volcanoes Tour',
  'Tour de Cuatro Volcanes',
  'Epic helicopter journey to witness Guatemala''s most spectacular volcanoes: Agua, Fuego, Acatenango, and Pacaya',
  'Épico viaje en helicóptero para presenciar los volcanes más espectaculares de Guatemala: Agua, Fuego, Acatenango y Pacaya',
  2.5, 150,
  1899.00, 4, 2,
  ARRAY['Professional pilot', 'Four volcano circuit', 'Geological insights', 'Aerial photography', 'Safety equipment'],
  ARRAY['Piloto profesional', 'Circuito de cuatro volcanes', 'Conocimientos geológicos', 'Fotografía aérea', 'Equipo de seguridad'],
  'Volcano circuit',
  '[{"aircraft": "Robinson R66", "capacity": 4, "price": 1899}, {"aircraft": "Airbus H125", "capacity": 5, "price": 2299}]'::jsonb,
  ARRAY['Agua Volcano', 'Fuego Volcano', 'Acatenango Volcano', 'Pacaya Volcano'],
  'volcano', true
),

-- Beach & Coast
(
  'Monterrico Beach Experience',
  'Experiencia Playa Monterrico',
  'Helicopter flight to Guatemala''s famous black sand beaches with beach time and turtle conservation visit',
  'Vuelo en helicóptero a las famosas playas de arena negra de Guatemala con tiempo en la playa y visita de conservación de tortugas',
  4.0, 240,
  1599.00, 4, 2,
  ARRAY['Beach helicopter landing', 'Black sand beaches', 'Turtle conservation center', 'Lunch included', 'Beach time'],
  ARRAY['Aterrizaje en helicóptero en playa', 'Playas de arena negra', 'Centro de conservación de tortugas', 'Almuerzo incluido', 'Tiempo en playa'],
  'Monterrico, Pacific Coast',
  '[{"aircraft": "Robinson R66", "capacity": 4, "price": 1599}, {"aircraft": "Bell 206", "capacity": 4, "price": 1899}]'::jsonb,
  ARRAY['Guatemala City', 'Pacific Coast', 'Monterrico Beach', 'Turtle Sanctuary'],
  'beach', true
),

-- Cultural Tours
(
  'Tikal National Park Expedition',
  'Expedición Parque Nacional Tikal',
  'Full day helicopter expedition to Tikal with guided tour of ancient Mayan pyramids and jungle exploration',
  'Expedición de día completo en helicóptero a Tikal con tour guiado de pirámides mayas antiguas y exploración de la selva',
  8.0, 480,
  4500.00, 6, 2,
  ARRAY['Round trip helicopter', 'Professional guide', 'Tikal entrance fees', 'Lunch', 'Mayan ruins tour', 'Jungle wildlife'],
  ARRAY['Helicóptero ida y vuelta', 'Guía profesional', 'Tarifas de entrada a Tikal', 'Almuerzo', 'Tour ruinas mayas', 'Vida silvestre de la selva'],
  'Tikal, Petén',
  '[{"aircraft": "Bell 206 LongRanger", "capacity": 6, "price": 4500}, {"aircraft": "Airbus AS 350", "capacity": 5, "price": 5200}]'::jsonb,
  ARRAY['Guatemala City', 'Flores', 'Tikal National Park', 'El Mirador viewpoint'],
  'cultural', true
),

(
  'Lake Atitlán Complete Experience',
  'Experiencia Completa Lago Atitlán',
  'Helicopter flight to stunning Lake Atitlán with hotel landing, boat tour, and indigenous village visits',
  'Vuelo en helicóptero al impresionante Lago Atitlán con aterrizaje en hotel, tour en lancha y visitas a pueblos indígenas',
  5.0, 300,
  2299.00, 4, 2,
  ARRAY['Helicopter to lake', 'Hotel Casa Palopó landing', 'Boat tour', 'Indigenous villages', 'Local lunch', 'Cultural experience'],
  ARRAY['Helicóptero al lago', 'Aterrizaje Hotel Casa Palopó', 'Tour en lancha', 'Pueblos indígenas', 'Almuerzo local', 'Experiencia cultural'],
  'Lake Atitlán',
  '[{"aircraft": "Robinson R66", "capacity": 4, "price": 2299}, {"aircraft": "Bell 206", "capacity": 4, "price": 2699}]'::jsonb,
  ARRAY['Guatemala City', 'Lake Atitlán', 'Panajachel', 'Santiago Atitlán', 'San Pedro'],
  'cultural', true
),

-- Special Experiences
(
  'Seven Volcanoes + Atitlán Tour',
  'Tour Siete Volcanes + Atitlán',
  'Ultimate helicopter experience covering seven volcanoes and Lake Atitlán in one spectacular journey',
  'Experiencia definitiva en helicóptero cubriendo siete volcanes y el Lago Atitlán en un viaje espectacular',
  3.5, 210,
  3299.00, 4, 2,
  ARRAY['Seven volcano circuit', 'Lake Atitlán overflight', 'Professional commentary', 'Aerial photography', 'Premium experience'],
  ARRAY['Circuito de siete volcanes', 'Sobrevuelo Lago Atitlán', 'Comentario profesional', 'Fotografía aérea', 'Experiencia premium'],
  'Multi-volcano circuit',
  '[{"aircraft": "Bell 206 LongRanger", "capacity": 4, "price": 3299}, {"aircraft": "Airbus AS 350", "capacity": 5, "price": 3799}]'::jsonb,
  ARRAY['All major volcanoes', 'Lake Atitlán', 'Scenic viewpoints'],
  'volcano', true
),

(
  'Gender Reveal Helicopter Event',
  'Evento Revelación de Género en Helicóptero',
  'Unique helicopter experience for gender reveal celebrations with colored smoke and aerial photography',
  'Experiencia única en helicóptero para celebraciones de revelación de género con humo de colores y fotografía aérea',
  1.0, 60,
  899.00, 4, 2,
  ARRAY['Gender reveal setup', 'Colored smoke effects', 'Professional photography', 'Video recording', 'Special celebration'],
  ARRAY['Configuración revelación género', 'Efectos humo de colores', 'Fotografía profesional', 'Grabación video', 'Celebración especial'],
  'Special event location',
  '[{"aircraft": "Robinson R66", "capacity": 4, "price": 899}, {"aircraft": "Bell 206", "capacity": 4, "price": 1199}]'::jsonb,
  ARRAY['Special event airspace', 'Photo opportunity areas'],
  'romantic', true
);

-- Update category references
UPDATE experiences SET category_id = (SELECT id FROM experience_categories WHERE name_en = 'Scenic Tours') WHERE category = 'scenic';
UPDATE experiences SET category_id = (SELECT id FROM experience_categories WHERE name_en = 'Romantic Experiences') WHERE category = 'romantic';
UPDATE experiences SET category_id = (SELECT id FROM experience_categories WHERE name_en = 'Cultural Tours') WHERE category = 'cultural';
UPDATE experiences SET category_id = (SELECT id FROM experience_categories WHERE name_en = 'Volcano Tours') WHERE category = 'volcano';
UPDATE experiences SET category_id = (SELECT id FROM experience_categories WHERE name_en = 'Beach & Coast') WHERE category = 'beach';

-- Create multilingual content table for general translations
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  en TEXT NOT NULL,
  es TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(key)
);

-- Insert general UI translations
INSERT INTO translations (key, en, es, context) VALUES 
('nav.home', 'Home', 'Inicio', 'navigation'),
('nav.experiences', 'Experiences', 'Experiencias', 'navigation'),
('nav.transport', 'Transport', 'Transporte', 'navigation'),
('nav.pilot_opportunities', 'Pilot Opportunities', 'Oportunidades para Pilotos', 'navigation'),
('nav.login', 'Login', 'Iniciar Sesión', 'navigation'),
('nav.register', 'Register', 'Registrarse', 'navigation'),

('hero.title', 'Experience Guatemala from Above', 'Experimenta Guatemala desde las Alturas', 'homepage'),
('hero.subtitle', 'Premium helicopter transport and exclusive aerial experiences across Guatemala''s most breathtaking destinations', 'Transporte premium en helicóptero y experiencias aéreas exclusivas por los destinos más impresionantes de Guatemala', 'homepage'),

('services.transport.title', 'Direct Transport', 'Transporte Directo', 'services'),
('services.transport.description', 'Point-to-point helicopter transport between airports and custom airfields. Fast, convenient, and luxurious travel across Guatemala.', 'Transporte en helicóptero punto a punto entre aeropuertos y pistas personalizadas. Viajes rápidos, convenientes y lujosos por Guatemala.', 'services'),
('services.transport.cta', 'Book Transport', 'Reservar Transporte', 'services'),

('services.experiences.title', 'Experiences', 'Experiencias', 'services'),
('services.experiences.description', 'Curated aerial tours, hotel packages in Antigua and Lake Atitlán, and exclusive sightseeing experiences.', 'Tours aéreos curados, paquetes de hotel en Antigua y Lago Atitlán, y experiencias exclusivas de turismo.', 'services'),
('services.experiences.cta', 'Explore Experiences', 'Explorar Experiencias', 'services'),

('how_it_works.title', 'How It Works', 'Cómo Funciona', 'process'),
('how_it_works.step1.title', 'Book Your Flight', 'Reserva tu Vuelo', 'process'),
('how_it_works.step1.description', 'Choose transport or experience package', 'Elige transporte o paquete de experiencia', 'process'),
('how_it_works.step2.title', 'Get Confirmed', 'Obtén Confirmación', 'process'),
('how_it_works.step2.description', 'Receive confirmation with pilot details', 'Recibe confirmación con detalles del piloto', 'process'),
('how_it_works.step3.title', 'Fly in Style', 'Vuela con Estilo', 'process'),
('how_it_works.step3.description', 'Enjoy your premium helicopter experience', 'Disfruta tu experiencia premium en helicóptero', 'process'),

('booking.form.from', 'From', 'Desde', 'booking'),
('booking.form.to', 'To', 'Hacia', 'booking'),
('booking.form.date', 'Date', 'Fecha', 'booking'),
('booking.form.time', 'Preferred Time', 'Hora Preferida', 'booking'),
('booking.form.passengers', 'Passengers', 'Pasajeros', 'booking'),
('booking.form.notes', 'Special Requests', 'Solicitudes Especiales', 'booking'),
('booking.form.aircraft', 'Aircraft Selection', 'Selección de Aeronave', 'booking'),
('booking.form.price_breakdown', 'Price Breakdown', 'Desglose de Precio', 'booking'),

('pilot.benefits.title', 'Why Pilots Choose FlyInGuate', 'Por Qué los Pilotos Eligen FlyInGuate', 'pilot_recruitment'),
('pilot.benefits.earnings', 'Premium Earnings', 'Ganancias Premium', 'pilot_recruitment'),
('pilot.benefits.schedule', 'Flexible Schedule', 'Horario Flexible', 'pilot_recruitment'),
('pilot.benefits.coverage', 'Full Coverage', 'Cobertura Completa', 'pilot_recruitment');

-- Create function to get translations
CREATE OR REPLACE FUNCTION get_translation(translation_key TEXT, lang TEXT DEFAULT 'en')
RETURNS TEXT AS $$
BEGIN
  IF lang = 'es' THEN
    RETURN (SELECT es FROM translations WHERE key = translation_key);
  ELSE
    RETURN (SELECT en FROM translations WHERE key = translation_key);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create view for experiences with translations
CREATE OR REPLACE VIEW experiences_multilingual AS
SELECT 
  e.*,
  ec.name_en as category_name_en,
  ec.name_es as category_name_es,
  ec.description_en as category_description_en,
  ec.description_es as category_description_es,
  ec.icon as category_icon
FROM experiences e
LEFT JOIN experience_categories ec ON e.category_id = ec.id
WHERE e.is_active = true
ORDER BY ec.sort_order, e.base_price;