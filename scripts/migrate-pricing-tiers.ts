import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required')
  process.exit(1)
}

// Define Experience schema inline for script compatibility
const experienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEs: { type: String, default: null },
  description: { type: String, required: true },
  descriptionEs: { type: String, default: null },
  durationHours: { type: Number, required: true, min: 0 },
  durationMinutes: { type: Number, default: null },
  basePrice: { type: Number, required: true, min: 0 },
  maxPassengers: { type: Number, default: 4, min: 1 },
  minPassengers: { type: Number, default: 1, min: 1 },
  includes: { type: [String], default: [] },
  includesEs: { type: [String], default: null },
  highlights: { type: [String], default: [] },
  requirements: { type: [String], default: [] },
  meetingPoint: { type: String, default: null },
  location: { type: String, required: true },
  aircraftOptions: { type: mongoose.Schema.Types.Mixed, default: null },
  routeWaypoints: { type: [String], default: [] },
  category: { type: String, default: 'helitour' },
  categoryNameEn: { type: String, default: null },
  categoryNameEs: { type: String, default: null },
  imageUrl: { type: String, default: null },
  pricingTiers: {
    type: [{
      minPassengers: { type: Number, required: true, min: 1 },
      maxPassengers: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }],
    default: []
  },
  orderIndex: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
  contentEditedAt: { type: Date, default: null }
}, { timestamps: true })

const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema)

// Standard 4 brackets
function makeTiers(p12: number, p34: number, p56: number, p7plus: number = 0) {
  return [
    { minPassengers: 1, maxPassengers: 2, price: p12 },
    { minPassengers: 3, maxPassengers: 4, price: p34 },
    { minPassengers: 5, maxPassengers: 6, price: p56 },
    { minPassengers: 7, maxPassengers: 99, price: p7plus }
  ]
}

interface ExperienceData {
  matchPatterns: string[]
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  durationHours: number
  durationMinutes: number
  basePrice: number
  minPassengers: number
  maxPassengers: number
  includes: string[]
  includesEs: string[]
  location: string
  category: string
  pricingTiers: { minPassengers: number; maxPassengers: number; price: number }[]
}

const EXPERIENCES: ExperienceData[] = [
  // === PANORAMIC OVERFLIGHTS ===
  {
    matchPatterns: ['heli-tour ciudad', 'laguna calderas', 'ciudad, antigua'],
    name: 'Heli-Tour Ciudad, Antigua & Laguna Calderas',
    nameEs: 'Heli-Tour Ciudad, Antigua y Laguna Calderas',
    description: 'Panoramic tour of Guatemala City, colonial Antigua, Pacaya Volcano, and Amatitlan Lake in 35 unforgettable minutes.',
    descriptionEs: 'Tour panoramico de Ciudad de Guatemala, la colonial Antigua, volcan Pacaya y lago de Amatitlan en 35 minutos inolvidables.',
    durationHours: 0.58,
    durationMinutes: 35,
    basePrice: 575,
    minPassengers: 1,
    maxPassengers: 3,
    includes: ['Professional pilot', 'Aerial photography', 'Safety briefing', 'Stunning views'],
    includesEs: ['Piloto profesional', 'Fotografia aerea', 'Briefing de seguridad', 'Vistas impresionantes'],
    location: 'Guatemala City - Antigua',
    category: 'scenic',
    pricingTiers: makeTiers(575, 575, 0)
  },
  {
    matchPatterns: ['panoramic overflight', 'sobrevuelo panoramico', 'panoramic overflight - 45'],
    name: 'Panoramic Overflight - 45 min',
    nameEs: 'Sobrevuelo Panoramico - 45 min',
    description: 'Extended panoramic tour featuring Guatemala City, Antigua, surrounding volcanoes, and pristine lakes.',
    descriptionEs: 'Tour panoramico extendido que incluye Ciudad de Guatemala, Antigua, volcanes circundantes y lagos pristinos.',
    durationHours: 0.75,
    durationMinutes: 45,
    basePrice: 875,
    minPassengers: 1,
    maxPassengers: 4,
    includes: ['Professional pilot', 'Extended route', 'Multiple aircraft options', 'Scenic photography stops'],
    includesEs: ['Piloto profesional', 'Ruta extendida', 'Multiples opciones de aeronave', 'Paradas fotograficas panoramicas'],
    location: 'Guatemala City - Antigua - Volcanoes',
    category: 'scenic',
    pricingTiers: makeTiers(875, 1299, 0)
  },
  {
    matchPatterns: ['extended overflight', 'sobrevuelo extendido', 'extended overflight - 60'],
    name: 'Extended Overflight - 60 min',
    nameEs: 'Sobrevuelo Extendido - 60 min',
    description: 'Comprehensive aerial tour covering multiple landmarks, volcanoes, and breathtaking landscapes of Guatemala.',
    descriptionEs: 'Tour aereo integral que cubre multiples monumentos, volcanes y paisajes impresionantes de Guatemala.',
    durationHours: 1.0,
    durationMinutes: 60,
    basePrice: 975,
    minPassengers: 1,
    maxPassengers: 5,
    includes: ['Professional pilot', 'Comprehensive route', 'Premium aircraft options', 'Extended photo opportunities'],
    includesEs: ['Piloto profesional', 'Ruta integral', 'Opciones de aeronave premium', 'Oportunidades fotograficas extendidas'],
    location: 'Multi-destination tour',
    category: 'scenic',
    pricingTiers: makeTiers(975, 1499, 1960)
  },
  {
    matchPatterns: ['four volcanoes', 'cuatro volcanes', '4 volcanes'],
    name: 'Four Volcanoes Tour',
    nameEs: 'Heli Tour - 4 Volcanes Cercanos',
    description: 'Epic helicopter journey to witness Guatemala\'s most spectacular volcanoes: Agua, Fuego, Acatenango, and Pacaya.',
    descriptionEs: 'Epico viaje en helicoptero para presenciar los volcanes mas espectaculares de Guatemala: Agua, Fuego, Acatenango y Pacaya.',
    durationHours: 2.5,
    durationMinutes: 150,
    basePrice: 1560,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Professional pilot', 'Four volcano circuit', 'Geological insights', 'Aerial photography', 'Safety equipment'],
    includesEs: ['Piloto profesional', 'Circuito de cuatro volcanes', 'Conocimientos geologicos', 'Fotografia aerea', 'Equipo de seguridad'],
    location: 'Volcano circuit',
    category: 'scenic',
    pricingTiers: makeTiers(1560, 1560, 2290)
  },
  {
    matchPatterns: ['romantic heli', 'heli-tour romantico', 'romantico 35'],
    name: 'Romantic Heli-Tour',
    nameEs: 'Heli-Tour Romantico',
    description: 'Special romantic helicopter experience with flowers, champagne, and photography time for unforgettable moments.',
    descriptionEs: 'Experiencia romantica especial en helicoptero con flores, champan y tiempo para fotografias en momentos inolvidables.',
    durationHours: 0.58,
    durationMinutes: 35,
    basePrice: 599,
    minPassengers: 2,
    maxPassengers: 2,
    includes: ['Professional pilot', 'Fresh flowers', 'Champagne service', 'Professional photography', 'Romantic setup'],
    includesEs: ['Piloto profesional', 'Flores frescas', 'Servicio de champan', 'Fotografia profesional', 'Ambiente romantico'],
    location: 'Romantic scenic route',
    category: 'romantic',
    pricingTiers: makeTiers(599, 0, 0)
  },

  // === DESTINATION EXPERIENCES ===
  {
    matchPatterns: ['antigua guatemala', 'tenedor del cerro', 'antigua breakfast', 'antigua lunch', 'antigua desayunar', 'antigua almorzar'],
    name: 'Antigua Guatemala - Breakfast or Lunch',
    nameEs: 'Antigua Guatemala - Desayunar o Almorzar',
    description: 'Round trip helicopter flight to historic Antigua with a gourmet breakfast or lunch and exploration time in the colonial city.',
    descriptionEs: 'Vuelo de ida y vuelta en helicoptero a la historica Antigua con desayuno o almuerzo gourmet y tiempo de exploracion en la ciudad colonial.',
    durationHours: 3.0,
    durationMinutes: 180,
    basePrice: 985,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Round trip flight', 'Breakfast or lunch included', 'Antigua exploration time', 'Professional guide'],
    includesEs: ['Vuelo de ida y vuelta', 'Desayuno o almuerzo incluido', 'Tiempo de exploracion en Antigua', 'Guia profesional'],
    location: 'Antigua Guatemala',
    category: 'destination',
    pricingTiers: makeTiers(985, 1599, 2195)
  },
  {
    matchPatterns: ['finca san cayetano', 'san cayetano', 'alotenango'],
    name: 'Finca San Cayetano, Alotenango',
    nameEs: 'Finca San Cayetano, Alotenango',
    description: 'Helicopter flight to the stunning Finca San Cayetano in Alotenango with gourmet dining and volcanic views.',
    descriptionEs: 'Vuelo en helicoptero a la impresionante Finca San Cayetano en Alotenango con comida gourmet y vistas volcanicas.',
    durationHours: 3.0,
    durationMinutes: 180,
    basePrice: 985,
    minPassengers: 1,
    maxPassengers: 5,
    includes: ['Round trip flight', 'Gourmet dining', 'Volcanic views', 'Finca tour'],
    includesEs: ['Vuelo de ida y vuelta', 'Comida gourmet', 'Vistas volcanicas', 'Tour de la finca'],
    location: 'Alotenango',
    category: 'destination',
    pricingTiers: makeTiers(985, 1699, 2350)
  },
  {
    matchPatterns: ['hotel atitlan', 'atitlan panajachel', 'lake atitlan complete', 'atitlan complete'],
    name: 'Hotel Atitlan, Panajachel',
    nameEs: 'Hotel Atitlan, Panajachel',
    description: 'Helicopter flight to stunning Lake Atitlan with a visit to Hotel Atitlan, boat tour, and indigenous village visits.',
    descriptionEs: 'Vuelo en helicoptero al impresionante Lago Atitlan con visita al Hotel Atitlan, tour en lancha y visitas a pueblos indigenas.',
    durationHours: 5.0,
    durationMinutes: 300,
    basePrice: 1199,
    minPassengers: 1,
    maxPassengers: 5,
    includes: ['Helicopter to lake', 'Hotel Atitlan visit', 'Boat tour', 'Indigenous villages', 'Local lunch'],
    includesEs: ['Helicoptero al lago', 'Visita Hotel Atitlan', 'Tour en lancha', 'Pueblos indigenas', 'Almuerzo local'],
    location: 'Lake Atitlan',
    category: 'destination',
    pricingTiers: makeTiers(1199, 1650, 2299)
  },
  {
    matchPatterns: ['casa palopo', 'casa palop'],
    name: 'Hotel Casa Palopo',
    nameEs: 'Hotel Casa Palopo',
    description: 'Exclusive helicopter experience to the luxurious Hotel Casa Palopo on the shores of Lake Atitlan.',
    descriptionEs: 'Experiencia exclusiva en helicoptero al lujoso Hotel Casa Palopo en las orillas del Lago Atitlan.',
    durationHours: 5.0,
    durationMinutes: 300,
    basePrice: 1240,
    minPassengers: 1,
    maxPassengers: 5,
    includes: ['Helicopter flight', 'Hotel Casa Palopo visit', 'Gourmet lunch', 'Lake views'],
    includesEs: ['Vuelo en helicoptero', 'Visita Hotel Casa Palopo', 'Almuerzo gourmet', 'Vistas al lago'],
    location: 'Lake Atitlan',
    category: 'destination',
    pricingTiers: makeTiers(1240, 1799, 2299)
  },
  {
    matchPatterns: ['hotel el faro', 'el faro monterrico'],
    name: 'Hotel El Faro, Monterrico',
    nameEs: 'Hotel El Faro, Monterrico',
    description: 'Helicopter flight to the Pacific coast with a stay at the exclusive Hotel El Faro in Monterrico.',
    descriptionEs: 'Vuelo en helicoptero a la costa del Pacifico con estadia en el exclusivo Hotel El Faro en Monterrico.',
    durationHours: 4.0,
    durationMinutes: 240,
    basePrice: 1925,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Round trip flight', 'Hotel El Faro access', 'Beach time', 'Lunch included'],
    includesEs: ['Vuelo de ida y vuelta', 'Acceso Hotel El Faro', 'Tiempo en playa', 'Almuerzo incluido'],
    location: 'Monterrico, Pacific Coast',
    category: 'destination',
    pricingTiers: makeTiers(1925, 2860, 3700)
  },
  {
    matchPatterns: ['romantica hotel atitlan', 'romantic hotel atitlan', 'romantica atitlan'],
    name: 'Romantic Hotel Atitlan Experience',
    nameEs: 'Experiencia Romantica Hotel Atitlan',
    description: 'Romantic helicopter escape for couples to the beautiful Hotel Atitlan on the shores of Lake Atitlan.',
    descriptionEs: 'Escapada romantica en helicoptero para parejas al hermoso Hotel Atitlan en las orillas del Lago Atitlan.',
    durationHours: 5.0,
    durationMinutes: 300,
    basePrice: 1599,
    minPassengers: 2,
    maxPassengers: 2,
    includes: ['Round trip flight', 'Romantic setup', 'Gourmet lunch for two', 'Lake views', 'Photography'],
    includesEs: ['Vuelo de ida y vuelta', 'Ambiente romantico', 'Almuerzo gourmet para dos', 'Vistas al lago', 'Fotografia'],
    location: 'Lake Atitlan',
    category: 'romantic',
    pricingTiers: makeTiers(1599, 0, 0)
  },
  {
    matchPatterns: ['romantica hotel casa palopo', 'romantic hotel casa palopo', 'romantica casa palopo', 'romantic casa palopo', 'palopo romantico', 'palopo paquete romantico'],
    name: 'Romantic Hotel Casa Palopo',
    nameEs: 'Hotel Casa Palopo Paquete Romantico',
    description: 'Exclusive romantic helicopter experience for couples to the luxurious Hotel Casa Palopo.',
    descriptionEs: 'Experiencia romantica exclusiva en helicoptero para parejas al lujoso Hotel Casa Palopo.',
    durationHours: 5.0,
    durationMinutes: 300,
    basePrice: 1699,
    minPassengers: 2,
    maxPassengers: 2,
    includes: ['Round trip flight', 'Romantic setup', 'Gourmet dining', 'Lake Atitlan views', 'Photography'],
    includesEs: ['Vuelo de ida y vuelta', 'Ambiente romantico', 'Comida gourmet', 'Vistas Lago Atitlan', 'Fotografia'],
    location: 'Lake Atitlan',
    category: 'romantic',
    pricingTiers: makeTiers(1699, 0, 0)
  },
  {
    matchPatterns: ['proposal', 'paquete proposal'],
    name: 'Proposal Package - Hotel Atitlan',
    nameEs: 'Paquete "Proposal" - Hotel Atitlan',
    description: 'The ultimate proposal experience with a helicopter flight to Hotel Atitlan, romantic setup, and professional photography.',
    descriptionEs: 'La experiencia definitiva de propuesta con vuelo en helicoptero al Hotel Atitlan, ambiente romantico y fotografia profesional.',
    durationHours: 5.0,
    durationMinutes: 300,
    basePrice: 2299,
    minPassengers: 2,
    maxPassengers: 2,
    includes: ['Round trip flight', 'Proposal setup', 'Professional photography', 'Champagne', 'Gourmet dinner'],
    includesEs: ['Vuelo de ida y vuelta', 'Preparacion de propuesta', 'Fotografia profesional', 'Champan', 'Cena gourmet'],
    location: 'Lake Atitlan',
    category: 'romantic',
    pricingTiers: makeTiers(2299, 0, 0)
  },
  {
    matchPatterns: ['semuc champey', 'cuevas kan'],
    name: 'Semuc Champey + Cuevas Kan\'ba',
    nameEs: 'Semuc Champey + Cuevas Kan\'ba',
    description: 'Adventure helicopter flight to Semuc Champey natural pools and the Kan\'ba caves, a once-in-a-lifetime experience.',
    descriptionEs: 'Vuelo de aventura en helicoptero a las piscinas naturales de Semuc Champey y las cuevas Kan\'ba, una experiencia unica.',
    durationHours: 6.0,
    durationMinutes: 360,
    basePrice: 1599,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Round trip flight', 'Semuc Champey access', 'Cave tour', 'Lunch included', 'Professional guide'],
    includesEs: ['Vuelo de ida y vuelta', 'Acceso a Semuc Champey', 'Tour de cuevas', 'Almuerzo incluido', 'Guia profesional'],
    location: 'Semuc Champey, Alta Verapaz',
    category: 'destination',
    pricingTiers: makeTiers(1599, 2399, 3299)
  },
  {
    matchPatterns: ['villas la mar', 'la mar monterrico'],
    name: 'Villas La Mar Monterrico',
    nameEs: 'Villas La Mar Monterrico',
    description: 'Helicopter flight to the exclusive Villas La Mar resort on the Pacific coast in Monterrico.',
    descriptionEs: 'Vuelo en helicoptero al exclusivo resort Villas La Mar en la costa del Pacifico en Monterrico.',
    durationHours: 4.0,
    durationMinutes: 240,
    basePrice: 1975,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Round trip flight', 'Villas La Mar access', 'Beach time', 'Lunch included'],
    includesEs: ['Vuelo de ida y vuelta', 'Acceso Villas La Mar', 'Tiempo en playa', 'Almuerzo incluido'],
    location: 'Monterrico, Pacific Coast',
    category: 'destination',
    pricingTiers: makeTiers(1975, 2975, 3799)
  },

  // === EXTENDED ADVENTURES ===
  {
    matchPatterns: ['tikal 1 day', 'tikal 1-day', 'tikal national park', 'tikal expedition', 'parque nacional tikal'],
    name: 'Tikal 1-Day Experience',
    nameEs: 'Parque Nacional Tikal 1 Day Experience',
    description: 'Full day experience to Tikal with private plane, guided tour of ancient Mayan pyramids and jungle exploration.',
    descriptionEs: 'Experiencia de dia completo a Tikal con avion privado, tour guiado de piramides mayas antiguas y exploracion de la selva.',
    durationHours: 8.0,
    durationMinutes: 480,
    basePrice: 2299,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Round trip flight', 'Professional guide', 'Tikal entrance fees', 'Lunch', 'Mayan ruins tour'],
    includesEs: ['Vuelo de ida y vuelta', 'Guia profesional', 'Tarifas de entrada a Tikal', 'Almuerzo', 'Tour ruinas mayas'],
    location: 'Tikal, Peten',
    category: 'adventure',
    pricingTiers: makeTiers(2299, 3299, 4875)
  },
  {
    matchPatterns: ['seven volcanoes', 'siete volcanes', '7 volcanes'],
    name: 'Seven Volcanoes + Atitlan Tour',
    nameEs: 'Sobrevuelo 7 Volcanes + Atitlan',
    description: 'Ultimate helicopter experience covering seven volcanoes and Lake Atitlan in one spectacular journey.',
    descriptionEs: 'Experiencia definitiva en helicoptero cubriendo siete volcanes y el Lago Atitlan en un viaje espectacular.',
    durationHours: 3.5,
    durationMinutes: 210,
    basePrice: 2799,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Seven volcano circuit', 'Lake Atitlan overflight', 'Professional commentary', 'Aerial photography'],
    includesEs: ['Circuito de siete volcanes', 'Sobrevuelo Lago Atitlan', 'Comentario profesional', 'Fotografia aerea'],
    location: 'Multi-volcano circuit',
    category: 'scenic',
    pricingTiers: makeTiers(2799, 3299, 3799)
  },
  {
    matchPatterns: ['sport fishing', 'pesca deportiva'],
    name: 'Heli-Tour & Sport Fishing',
    nameEs: 'Heli-Tour y Pesca Deportiva',
    description: 'Combine a helicopter tour with deep sea sport fishing on the Pacific coast of Guatemala.',
    descriptionEs: 'Combina un tour en helicoptero con pesca deportiva en alta mar en la costa del Pacifico de Guatemala.',
    durationHours: 8.0,
    durationMinutes: 480,
    basePrice: 2900,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Helicopter flight', 'Sport fishing boat', 'Fishing equipment', 'Lunch on board', 'Professional crew'],
    includesEs: ['Vuelo en helicoptero', 'Lancha de pesca deportiva', 'Equipo de pesca', 'Almuerzo a bordo', 'Tripulacion profesional'],
    location: 'Pacific Coast',
    category: 'adventure',
    pricingTiers: makeTiers(2900, 3900, 4700)
  },
  {
    matchPatterns: ['rio dulce helicopter', 'rio dulce helico'],
    name: 'Rio Dulce - All Inclusive (Helicopter)',
    nameEs: 'Rio Dulce - Todo Incluido (Helicoptero)',
    description: 'Helicopter flight to Rio Dulce with boat tour, Castillo de San Felipe visit, and Caribbean coast exploration.',
    descriptionEs: 'Vuelo en helicoptero a Rio Dulce con tour en lancha, visita al Castillo de San Felipe y exploracion de la costa caribeña.',
    durationHours: 6.0,
    durationMinutes: 360,
    basePrice: 2400,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Helicopter flight', 'Boat tour', 'Castillo de San Felipe', 'Seafood lunch', 'Return flight'],
    includesEs: ['Vuelo en helicoptero', 'Tour en lancha', 'Castillo de San Felipe', 'Almuerzo de mariscos', 'Vuelo de regreso'],
    location: 'Rio Dulce',
    category: 'adventure',
    pricingTiers: makeTiers(2400, 3200, 4375)
  },
  {
    matchPatterns: ['rio dulce airplane', 'rio dulce avion', 'rio dulce plane'],
    name: 'Rio Dulce - All Inclusive (Airplane)',
    nameEs: 'Rio Dulce - Todo Incluido (Avion)',
    description: 'Private airplane flight to Rio Dulce with boat tour, Castillo de San Felipe visit, and Caribbean coast exploration.',
    descriptionEs: 'Vuelo en avion privado a Rio Dulce con tour en lancha, visita al Castillo de San Felipe y exploracion de la costa caribeña.',
    durationHours: 6.0,
    durationMinutes: 360,
    basePrice: 1600,
    minPassengers: 1,
    maxPassengers: 6,
    includes: ['Private airplane flight', 'Boat tour', 'Castillo de San Felipe', 'Seafood lunch', 'Return flight'],
    includesEs: ['Vuelo en avion privado', 'Tour en lancha', 'Castillo de San Felipe', 'Almuerzo de mariscos', 'Vuelo de regreso'],
    location: 'Rio Dulce',
    category: 'adventure',
    pricingTiers: makeTiers(1600, 2700, 3625)
  },
  {
    matchPatterns: ['el mirador', 'la danta'],
    name: 'El Mirador - La Danta',
    nameEs: 'El Mirador - La Danta (Desde Flores, Peten)',
    description: 'Adventure to the ancient Mayan city of El Mirador and the massive La Danta pyramid, departing from Flores.',
    descriptionEs: 'Aventura a la antigua ciudad maya de El Mirador y la masiva piramide La Danta, saliendo desde Flores.',
    durationHours: 8.0,
    durationMinutes: 480,
    basePrice: 1300,
    minPassengers: 1,
    maxPassengers: 5,
    includes: ['Flight from Flores', 'El Mirador access', 'La Danta pyramid', 'Professional guide', 'Lunch'],
    includesEs: ['Vuelo desde Flores', 'Acceso a El Mirador', 'Piramide La Danta', 'Guia profesional', 'Almuerzo'],
    location: 'El Mirador, Peten',
    category: 'adventure',
    pricingTiers: makeTiers(1300, 2600, 3250)
  }
]

function findMatch(dbExperiences: any[], patterns: string[]): any | null {
  for (const exp of dbExperiences) {
    const nameLower = (exp.name || '').toLowerCase()
    const nameEsLower = (exp.nameEs || '').toLowerCase()
    for (const pattern of patterns) {
      if (nameLower.includes(pattern.toLowerCase()) || nameEsLower.includes(pattern.toLowerCase())) {
        return exp
      }
    }
  }
  return null
}

async function migrate() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI!)
    console.log('Connected to MongoDB\n')

    const dbExperiences = await Experience.find({}).lean()
    console.log(`Found ${dbExperiences.length} experiences in DB\n`)

    const matched: string[] = []
    const created: string[] = []
    const unmatched: string[] = []

    for (const expData of EXPERIENCES) {
      const dbExp = findMatch(dbExperiences, expData.matchPatterns)

      if (dbExp) {
        // Update existing experience
        console.log(`MATCH: "${dbExp.name}" -> updating pricing tiers`)
        console.log(`  Before: basePrice=${dbExp.basePrice}, tiers=${(dbExp.pricingTiers || []).length}`)

        await Experience.findByIdAndUpdate(dbExp._id, {
          $set: {
            pricingTiers: expData.pricingTiers,
            basePrice: expData.basePrice,
            minPassengers: expData.minPassengers,
            maxPassengers: expData.maxPassengers,
            contentEditedAt: new Date()
          }
        })

        console.log(`  After: basePrice=${expData.basePrice}, tiers=4`)
        console.log(`  Tiers: 1-2=$${expData.pricingTiers[0].price}, 3-4=$${expData.pricingTiers[1].price}, 5-6=$${expData.pricingTiers[2].price}, 7+=contact`)
        matched.push(dbExp.name)
      } else {
        // Create new experience
        console.log(`CREATE: "${expData.name}" (not found in DB)`)
        await Experience.create({
          name: expData.name,
          nameEs: expData.nameEs,
          description: expData.description,
          descriptionEs: expData.descriptionEs,
          durationHours: expData.durationHours,
          durationMinutes: expData.durationMinutes,
          basePrice: expData.basePrice,
          minPassengers: expData.minPassengers,
          maxPassengers: expData.maxPassengers,
          includes: expData.includes,
          includesEs: expData.includesEs,
          location: expData.location,
          category: expData.category,
          pricingTiers: expData.pricingTiers,
          isActive: true
        })
        console.log(`  Created with 4 tiers: 1-2=$${expData.pricingTiers[0].price}, 3-4=$${expData.pricingTiers[1].price}, 5-6=$${expData.pricingTiers[2].price}, 7+=contact`)
        created.push(expData.name)
      }
      console.log('')
    }

    // Check for DB experiences that weren't matched to any website experience
    const allMatchedNames = matched.map(n => n.toLowerCase())
    for (const dbExp of dbExperiences) {
      const wasMatched = allMatchedNames.includes((dbExp as any).name?.toLowerCase())
      if (!wasMatched) {
        unmatched.push((dbExp as any).name)
      }
    }

    // For unmatched DB experiences, add default 4 tiers based on their basePrice
    if (unmatched.length > 0) {
      console.log('--- UNMATCHED DB EXPERIENCES (adding default tiers) ---')
      for (const name of unmatched) {
        const dbExp = dbExperiences.find((e: any) => e.name === name) as any
        if (dbExp && (!dbExp.pricingTiers || dbExp.pricingTiers.length !== 4)) {
          const bp = dbExp.basePrice || 0
          const defaultTiers = makeTiers(bp, Math.round(bp * 1.5), Math.round(bp * 2))
          console.log(`DEFAULT TIERS: "${name}" (basePrice=$${bp})`)
          console.log(`  Tiers: 1-2=$${defaultTiers[0].price}, 3-4=$${defaultTiers[1].price}, 5-6=$${defaultTiers[2].price}, 7+=contact`)
          await Experience.findByIdAndUpdate(dbExp._id, {
            $set: {
              pricingTiers: defaultTiers,
              contentEditedAt: new Date()
            }
          })
        }
      }
    }

    console.log('\n=== SUMMARY ===')
    console.log(`Matched & updated: ${matched.length}`)
    matched.forEach(n => console.log(`  - ${n}`))
    console.log(`Created new: ${created.length}`)
    created.forEach(n => console.log(`  + ${n}`))
    console.log(`Unmatched DB (default tiers): ${unmatched.length}`)
    unmatched.forEach(n => console.log(`  ? ${n}`))

    // Final verification
    const finalExperiences = await Experience.find({ isActive: true }).lean()
    console.log(`\nTotal active experiences: ${finalExperiences.length}`)
    const withTiers = finalExperiences.filter((e: any) => e.pricingTiers && e.pricingTiers.length === 4)
    console.log(`With 4 pricing tiers: ${withTiers.length}`)
    const withoutTiers = finalExperiences.filter((e: any) => !e.pricingTiers || e.pricingTiers.length !== 4)
    if (withoutTiers.length > 0) {
      console.log(`WITHOUT 4 tiers: ${withoutTiers.length}`)
      withoutTiers.forEach((e: any) => console.log(`  ! ${e.name} (has ${(e.pricingTiers || []).length} tiers)`))
    }

  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

migrate()
