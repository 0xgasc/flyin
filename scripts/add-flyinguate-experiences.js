const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const flyinguateExperiences = [
  {
    name: 'Heli-Tour Ciudad, Antigua & Laguna Calderas',
    name_es: 'Heli-Tour Ciudad, Antigua y Laguna Calderas',
    description: 'Panoramic tour of Guatemala City, colonial Antigua, Pacaya Volcano, and Amatitlán Lake in 35 unforgettable minutes',
    description_es: 'Tour panorámico de Ciudad de Guatemala, la colonial Antigua, volcán Pacaya y lago de Amatitlán en 35 minutos inolvidables',
    duration_hours: 0.58,
    duration_minutes: 35,
    base_price: 479.00,
    max_passengers: 3,
    min_passengers: 2,
    includes: ['Professional pilot', 'Aerial photography', 'Safety briefing', 'Stunning views'],
    includes_es: ['Piloto profesional', 'Fotografía aérea', 'Briefing de seguridad', 'Vistas impresionantes'],
    location: 'Guatemala City - Antigua',
    aircraft_options: [{"aircraft": "Robinson R44 II", "capacity": 3, "price": 479}],
    route_waypoints: ['Guatemala City', 'Antigua Guatemala', 'Pacaya Volcano', 'Lake Amatitlán'],
    category: 'scenic',
    is_active: true
  },
  {
    name: 'Panoramic Overflight - 45 min',
    name_es: 'Sobrevuelo Panorámico - 45 min',
    description: 'Extended panoramic tour featuring Guatemala City, Antigua, surrounding volcanoes, and pristine lakes',
    description_es: 'Tour panorámico extendido que incluye Ciudad de Guatemala, Antigua, volcanes circundantes y lagos prístinos',
    duration_hours: 0.75,
    duration_minutes: 45,
    base_price: 745.00,
    max_passengers: 4,
    min_passengers: 2,
    includes: ['Professional pilot', 'Extended route', 'Multiple aircraft options', 'Scenic photography stops'],
    includes_es: ['Piloto profesional', 'Ruta extendida', 'Múltiples opciones de aeronave', 'Paradas fotográficas panorámicas'],
    location: 'Guatemala City - Antigua - Volcanoes',
    aircraft_options: [{"aircraft": "Robinson R44 II", "capacity": 3, "price": 745}, {"aircraft": "Robinson R66", "capacity": 4, "price": 979}],
    route_waypoints: ['Guatemala City', 'Antigua Guatemala', 'Agua Volcano', 'Fuego Volcano', 'Acatenango Volcano'],
    category: 'scenic',
    is_active: true
  },
  {
    name: 'Extended Overflight - 60 min',
    name_es: 'Sobrevuelo Extendido - 60 min',
    description: 'Comprehensive aerial tour covering multiple landmarks, volcanoes, and breathtaking landscapes of Guatemala',
    description_es: 'Tour aéreo integral que cubre múltiples monumentos, volcanes y paisajes impresionantes de Guatemala',
    duration_hours: 1.0,
    duration_minutes: 60,
    base_price: 899.00,
    max_passengers: 5,
    min_passengers: 2,
    includes: ['Professional pilot', 'Comprehensive route', 'Premium aircraft options', 'Extended photo opportunities'],
    includes_es: ['Piloto profesional', 'Ruta integral', 'Opciones de aeronave premium', 'Oportunidades fotográficas extendidas'],
    location: 'Multi-destination tour',
    aircraft_options: [{"aircraft": "Robinson R44 II", "capacity": 2, "price": 899}, {"aircraft": "Robinson R66", "capacity": 4, "price": 1199}, {"aircraft": "Airbus H125", "capacity": 5, "price": 1799}],
    route_waypoints: ['Guatemala City', 'Antigua', 'Lake Amatitlán', 'Pacaya Volcano', 'Agua Volcano'],
    category: 'scenic',
    is_active: true
  },
  {
    name: 'Romantic Heli-Tour',
    name_es: 'Heli-Tour Romántico',
    description: 'Special romantic helicopter experience with flowers, champagne, and photography time for unforgettable moments',
    description_es: 'Experiencia romántica especial en helicóptero con flores, champán y tiempo para fotografías en momentos inolvidables',
    duration_hours: 0.58,
    duration_minutes: 35,
    base_price: 525.00,
    max_passengers: 2,
    min_passengers: 2,
    includes: ['Professional pilot', 'Fresh flowers', 'Champagne service', 'Professional photography', 'Romantic setup'],
    includes_es: ['Piloto profesional', 'Flores frescas', 'Servicio de champán', 'Fotografía profesional', 'Ambiente romántico'],
    location: 'Romantic scenic route',
    aircraft_options: [{"aircraft": "Robinson R44 II", "capacity": 2, "price": 525}],
    route_waypoints: ['Romantic viewpoints', 'Sunset locations', 'Private moments'],
    category: 'romantic',
    is_active: true
  },
  {
    name: 'Antigua Guatemala / Tenedor del Cerro',
    name_es: 'Antigua Guatemala / Tenedor del Cerro',
    description: 'Round trip helicopter flight to historic Antigua with lunch and exploration time in the colonial city',
    description_es: 'Vuelo de ida y vuelta en helicóptero a la histórica Antigua con almuerzo y tiempo de exploración en la ciudad colonial',
    duration_hours: 3.0,
    duration_minutes: 180,
    base_price: 999.00,
    max_passengers: 5,
    min_passengers: 2,
    includes: ['Round trip flight', 'Lunch included', 'Antigua exploration time', 'Professional guide', 'Historical sites'],
    includes_es: ['Vuelo de ida y vuelta', 'Almuerzo incluido', 'Tiempo de exploración en Antigua', 'Guía profesional', 'Sitios históricos'],
    location: 'Antigua Guatemala',
    aircraft_options: [{"aircraft": "Robinson R44 II", "capacity": 2, "price": 999}, {"aircraft": "Robinson R66", "capacity": 4, "price": 1399}, {"aircraft": "Airbus H125", "capacity": 5, "price": 1999}],
    route_waypoints: ['Guatemala City', 'Antigua Guatemala', 'Tenedor del Cerro'],
    category: 'cultural',
    is_active: true
  },
  {
    name: 'Four Volcanoes Tour',
    name_es: 'Tour de Cuatro Volcanes',
    description: 'Epic helicopter journey to witness Guatemala\'s most spectacular volcanoes: Agua, Fuego, Acatenango, and Pacaya',
    description_es: 'Épico viaje en helicóptero para presenciar los volcanes más espectaculares de Guatemala: Agua, Fuego, Acatenango y Pacaya',
    duration_hours: 2.5,
    duration_minutes: 150,
    base_price: 1899.00,
    max_passengers: 4,
    min_passengers: 2,
    includes: ['Professional pilot', 'Four volcano circuit', 'Geological insights', 'Aerial photography', 'Safety equipment'],
    includes_es: ['Piloto profesional', 'Circuito de cuatro volcanes', 'Conocimientos geológicos', 'Fotografía aérea', 'Equipo de seguridad'],
    location: 'Volcano circuit',
    aircraft_options: [{"aircraft": "Robinson R66", "capacity": 4, "price": 1899}, {"aircraft": "Airbus H125", "capacity": 5, "price": 2299}],
    route_waypoints: ['Agua Volcano', 'Fuego Volcano', 'Acatenango Volcano', 'Pacaya Volcano'],
    category: 'volcano',
    is_active: true
  },
  {
    name: 'Monterrico Beach Experience',
    name_es: 'Experiencia Playa Monterrico',
    description: 'Helicopter flight to Guatemala\'s famous black sand beaches with beach time and turtle conservation visit',
    description_es: 'Vuelo en helicóptero a las famosas playas de arena negra de Guatemala con tiempo en la playa y visita de conservación de tortugas',
    duration_hours: 4.0,
    duration_minutes: 240,
    base_price: 1599.00,
    max_passengers: 4,
    min_passengers: 2,
    includes: ['Beach helicopter landing', 'Black sand beaches', 'Turtle conservation center', 'Lunch included', 'Beach time'],
    includes_es: ['Aterrizaje en helicóptero en playa', 'Playas de arena negra', 'Centro de conservación de tortugas', 'Almuerzo incluido', 'Tiempo en playa'],
    location: 'Monterrico, Pacific Coast',
    aircraft_options: [{"aircraft": "Robinson R66", "capacity": 4, "price": 1599}, {"aircraft": "Bell 206", "capacity": 4, "price": 1899}],
    route_waypoints: ['Guatemala City', 'Pacific Coast', 'Monterrico Beach', 'Turtle Sanctuary'],
    category: 'beach',
    is_active: true
  },
  {
    name: 'Tikal National Park Expedition',
    name_es: 'Expedición Parque Nacional Tikal',
    description: 'Full day helicopter expedition to Tikal with guided tour of ancient Mayan pyramids and jungle exploration',
    description_es: 'Expedición de día completo en helicóptero a Tikal con tour guiado de pirámides mayas antiguas y exploración de la selva',
    duration_hours: 8.0,
    duration_minutes: 480,
    base_price: 4500.00,
    max_passengers: 6,
    min_passengers: 2,
    includes: ['Round trip helicopter', 'Professional guide', 'Tikal entrance fees', 'Lunch', 'Mayan ruins tour', 'Jungle wildlife'],
    includes_es: ['Helicóptero ida y vuelta', 'Guía profesional', 'Tarifas de entrada a Tikal', 'Almuerzo', 'Tour ruinas mayas', 'Vida silvestre de la selva'],
    location: 'Tikal, Petén',
    aircraft_options: [{"aircraft": "Bell 206 LongRanger", "capacity": 6, "price": 4500}, {"aircraft": "Airbus AS 350", "capacity": 5, "price": 5200}],
    route_waypoints: ['Guatemala City', 'Flores', 'Tikal National Park', 'El Mirador viewpoint'],
    category: 'cultural',
    is_active: true
  },
  {
    name: 'Lake Atitlán Complete Experience',
    name_es: 'Experiencia Completa Lago Atitlán',
    description: 'Helicopter flight to stunning Lake Atitlán with hotel landing, boat tour, and indigenous village visits',
    description_es: 'Vuelo en helicóptero al impresionante Lago Atitlán con aterrizaje en hotel, tour en lancha y visitas a pueblos indígenas',
    duration_hours: 5.0,
    duration_minutes: 300,
    base_price: 2299.00,
    max_passengers: 4,
    min_passengers: 2,
    includes: ['Helicopter to lake', 'Hotel Casa Palopó landing', 'Boat tour', 'Indigenous villages', 'Local lunch', 'Cultural experience'],
    includes_es: ['Helicóptero al lago', 'Aterrizaje Hotel Casa Palopó', 'Tour en lancha', 'Pueblos indígenas', 'Almuerzo local', 'Experiencia cultural'],
    location: 'Lake Atitlán',
    aircraft_options: [{"aircraft": "Robinson R66", "capacity": 4, "price": 2299}, {"aircraft": "Bell 206", "capacity": 4, "price": 2699}],
    route_waypoints: ['Guatemala City', 'Lake Atitlán', 'Panajachel', 'Santiago Atitlán', 'San Pedro'],
    category: 'cultural',
    is_active: true
  },
  {
    name: 'Seven Volcanoes + Atitlán Tour',
    name_es: 'Tour Siete Volcanes + Atitlán',
    description: 'Ultimate helicopter experience covering seven volcanoes and Lake Atitlán in one spectacular journey',
    description_es: 'Experiencia definitiva en helicóptero cubriendo siete volcanes y el Lago Atitlán en un viaje espectacular',
    duration_hours: 3.5,
    duration_minutes: 210,
    base_price: 3299.00,
    max_passengers: 4,
    min_passengers: 2,
    includes: ['Seven volcano circuit', 'Lake Atitlán overflight', 'Professional commentary', 'Aerial photography', 'Premium experience'],
    includes_es: ['Circuito de siete volcanes', 'Sobrevuelo Lago Atitlán', 'Comentario profesional', 'Fotografía aérea', 'Experiencia premium'],
    location: 'Multi-volcano circuit',
    aircraft_options: [{"aircraft": "Bell 206 LongRanger", "capacity": 4, "price": 3299}, {"aircraft": "Airbus AS 350", "capacity": 5, "price": 3799}],
    route_waypoints: ['All major volcanoes', 'Lake Atitlán', 'Scenic viewpoints'],
    category: 'volcano',
    is_active: true
  },
  {
    name: 'Gender Reveal Helicopter Event',
    name_es: 'Evento Revelación de Género en Helicóptero',
    description: 'Unique helicopter experience for gender reveal celebrations with colored smoke and aerial photography',
    description_es: 'Experiencia única en helicóptero para celebraciones de revelación de género con humo de colores y fotografía aérea',
    duration_hours: 1.0,
    duration_minutes: 60,
    base_price: 899.00,
    max_passengers: 4,
    min_passengers: 2,
    includes: ['Gender reveal setup', 'Colored smoke effects', 'Professional photography', 'Video recording', 'Special celebration'],
    includes_es: ['Configuración revelación género', 'Efectos humo de colores', 'Fotografía profesional', 'Grabación video', 'Celebración especial'],
    location: 'Special event location',
    aircraft_options: [{"aircraft": "Robinson R66", "capacity": 4, "price": 899}, {"aircraft": "Bell 206", "capacity": 4, "price": 1199}],
    route_waypoints: ['Special event airspace', 'Photo opportunity areas'],
    category: 'romantic',
    is_active: true
  }
]

async function addMissingColumns() {
  console.log('Adding missing columns to experiences table...')
  
  // We'll try to add the columns, but they might already exist
  const columnsToAdd = [
    { name: 'name_es', type: 'TEXT' },
    { name: 'description_es', type: 'TEXT' },
    { name: 'includes_es', type: 'TEXT[]' },
    { name: 'duration_minutes', type: 'INTEGER' },
    { name: 'min_passengers', type: 'INTEGER DEFAULT 1' },
    { name: 'aircraft_options', type: 'JSONB DEFAULT \'[]\'' },
    { name: 'route_waypoints', type: 'TEXT[] DEFAULT \'{}\''},
    { name: 'category', type: 'TEXT DEFAULT \'scenic\'' }
  ]
  
  // Note: We can't add columns directly via the client, but we can work with what we have
  console.log('Note: Additional columns may need to be added via Supabase dashboard or SQL editor')
}

async function addExperiences() {
  try {
    console.log('Clearing existing non-demo experiences...')
    
    // Delete experiences that aren't the original 4 demo ones
    const { error: deleteError } = await supabase
      .from('experiences')
      .delete()
      .not('name', 'in', ['Antigua Colonial Tour', 'Lake Atitlán Discovery', 'Tikal Ruins Experience', 'Pacific Coast Sunset'])
    
    if (deleteError) {
      console.log('Delete error (expected if no extra experiences):', deleteError.message)
    }
    
    console.log('Adding FlyInGuate experiences...')
    
    for (let i = 0; i < flyinguateExperiences.length; i++) {
      const experience = flyinguateExperiences[i]
      console.log(`Adding experience ${i + 1}/${flyinguateExperiences.length}: ${experience.name}`)
      
      // Convert aircraft_options to JSON string for storage
      const experienceData = {
        ...experience,
        aircraft_options: JSON.stringify(experience.aircraft_options)
      }
      
      const { data, error } = await supabase
        .from('experiences')
        .insert(experienceData)
        .select()
      
      if (error) {
        console.error(`Error adding ${experience.name}:`, error.message)
      } else {
        console.log(`✓ Added: ${experience.name}`)
      }
    }
    
    console.log('✅ All experiences added!')
    
    // Check final count
    const { data: final, error: finalError } = await supabase
      .from('experiences')
      .select('name, base_price, category')
      .eq('is_active', true)
      .order('base_price')
    
    if (finalError) {
      console.error('Error checking final experiences:', finalError)
    } else {
      console.log(`\nFinal count: ${final.length} experiences`)
      final.forEach(exp => {
        console.log(`- ${exp.name} ($${exp.base_price}) [${exp.category}]`)
      })
    }
    
  } catch (error) {
    console.error('Error adding experiences:', error)
  }
}

async function main() {
  await addMissingColumns()
  await addExperiences()
}

main()