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

// Experiences that match the current schema
const basicExperiences = [
  {
    name: 'Heli-Tour Ciudad, Antigua & Laguna Calderas',
    description: 'Panoramic tour of Guatemala City, colonial Antigua, Pacaya Volcano, and Amatitlán Lake in 35 unforgettable minutes',
    duration_hours: 0.6,
    base_price: 479.00,
    max_passengers: 3,
    includes: ['Professional pilot', 'Aerial photography', 'Safety briefing', 'Stunning views'],
    location: 'Guatemala City - Antigua',
    is_active: true
  },
  {
    name: 'Panoramic Overflight - 45 min',
    description: 'Extended panoramic tour featuring Guatemala City, Antigua, surrounding volcanoes, and pristine lakes',
    duration_hours: 0.75,
    base_price: 745.00,
    max_passengers: 4,
    includes: ['Professional pilot', 'Extended route', 'Multiple aircraft options', 'Scenic photography stops'],
    location: 'Guatemala City - Antigua - Volcanoes',
    is_active: true
  },
  {
    name: 'Extended Overflight - 60 min',
    description: 'Comprehensive aerial tour covering multiple landmarks, volcanoes, and breathtaking landscapes of Guatemala',
    duration_hours: 1.0,
    base_price: 899.00,
    max_passengers: 5,
    includes: ['Professional pilot', 'Comprehensive route', 'Premium aircraft options', 'Extended photo opportunities'],
    location: 'Multi-destination tour',
    is_active: true
  },
  {
    name: 'Romantic Heli-Tour',
    description: 'Special romantic helicopter experience with flowers, champagne, and photography time for unforgettable moments',
    duration_hours: 0.6,
    base_price: 525.00,
    max_passengers: 2,
    includes: ['Professional pilot', 'Fresh flowers', 'Champagne service', 'Professional photography', 'Romantic setup'],
    location: 'Romantic scenic route',
    is_active: true
  },
  {
    name: 'Antigua Guatemala Complete Experience',
    description: 'Round trip helicopter flight to historic Antigua with lunch and exploration time in the colonial city',
    duration_hours: 3.0,
    base_price: 999.00,
    max_passengers: 5,
    includes: ['Round trip flight', 'Lunch included', 'Antigua exploration time', 'Professional guide', 'Historical sites'],
    location: 'Antigua Guatemala',
    is_active: true
  },
  {
    name: 'Four Volcanoes Tour',
    description: 'Epic helicopter journey to witness Guatemala\'s most spectacular volcanoes: Agua, Fuego, Acatenango, and Pacaya',
    duration_hours: 2.5,
    base_price: 1899.00,
    max_passengers: 4,
    includes: ['Professional pilot', 'Four volcano circuit', 'Geological insights', 'Aerial photography', 'Safety equipment'],
    location: 'Volcano circuit',
    is_active: true
  },
  {
    name: 'Monterrico Beach Experience',
    description: 'Helicopter flight to Guatemala\'s famous black sand beaches with beach time and turtle conservation visit',
    duration_hours: 4.0,
    base_price: 1599.00,
    max_passengers: 4,
    includes: ['Beach helicopter landing', 'Black sand beaches', 'Turtle conservation center', 'Lunch included', 'Beach time'],
    location: 'Monterrico, Pacific Coast',
    is_active: true
  },
  {
    name: 'Tikal National Park Expedition',
    description: 'Full day helicopter expedition to Tikal with guided tour of ancient Mayan pyramids and jungle exploration',
    duration_hours: 8.0,
    base_price: 4500.00,
    max_passengers: 6,
    includes: ['Round trip helicopter', 'Professional guide', 'Tikal entrance fees', 'Lunch', 'Mayan ruins tour', 'Jungle wildlife'],
    location: 'Tikal, Petén',
    is_active: true
  },
  {
    name: 'Lake Atitlán Complete Experience',
    description: 'Helicopter flight to stunning Lake Atitlán with hotel landing, boat tour, and indigenous village visits',
    duration_hours: 5.0,
    base_price: 2299.00,
    max_passengers: 4,
    includes: ['Helicopter to lake', 'Hotel Casa Palopó landing', 'Boat tour', 'Indigenous villages', 'Local lunch', 'Cultural experience'],
    location: 'Lake Atitlán',
    is_active: true
  },
  {
    name: 'Seven Volcanoes + Atitlán Tour',
    description: 'Ultimate helicopter experience covering seven volcanoes and Lake Atitlán in one spectacular journey',
    duration_hours: 3.5,
    base_price: 3299.00,
    max_passengers: 4,
    includes: ['Seven volcano circuit', 'Lake Atitlán overflight', 'Professional commentary', 'Aerial photography', 'Premium experience'],
    location: 'Multi-volcano circuit',
    is_active: true
  },
  {
    name: 'Gender Reveal Helicopter Event',
    description: 'Unique helicopter experience for gender reveal celebrations with colored smoke and aerial photography',
    duration_hours: 1.0,
    base_price: 899.00,
    max_passengers: 4,
    includes: ['Gender reveal setup', 'Colored smoke effects', 'Professional photography', 'Video recording', 'Special celebration'],
    location: 'Special event location',
    is_active: true
  }
]

async function addExperiences() {
  try {
    console.log('Clearing existing demo experiences...')
    
    // First, clear out the demo experiences from schema.sql
    await supabase
      .from('experiences')
      .delete()
      .in('name', ['Antigua Colonial Tour', 'Lake Atitlán Discovery', 'Tikal Ruins Experience', 'Pacific Coast Sunset'])
    
    console.log('Adding real FlyInGuate experiences...')
    
    const { data, error } = await supabase
      .from('experiences')
      .insert(basicExperiences)
      .select()
    
    if (error) {
      console.error('Error adding experiences:', error)
      return
    }
    
    console.log(`✅ Successfully added ${data.length} experiences!`)
    
    // Check final count
    const { data: final, error: finalError } = await supabase
      .from('experiences')
      .select('name, base_price, location')
      .eq('is_active', true)
      .order('base_price')
    
    if (finalError) {
      console.error('Error checking final experiences:', finalError)
    } else {
      console.log(`\nTotal experiences: ${final.length}`)
      final.forEach(exp => {
        console.log(`- ${exp.name} ($${exp.base_price}) - ${exp.location}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addExperiences()