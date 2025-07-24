// Guatemala Departments Data with Airports and Destinations
export interface Department {
  id: string
  name: string
  coordinates: [number, number] // [lat, lng] for center point
  airports: Airport[]
  destinations: string[]
  experiences: string[]
  color: string // For map visualization
}

export interface Airport {
  name: string
  code: string
  type: 'international' | 'regional' | 'private'
  coordinates: [number, number]
}

export const guatemalaDepartments: Department[] = [
  {
    id: 'guatemala',
    name: 'Guatemala',
    coordinates: [14.6349, -90.5069],
    color: '#ef4444',
    airports: [
      { name: 'La Aurora International Airport', code: 'GUA', type: 'international', coordinates: [14.5833, -90.5275] }
    ],
    destinations: ['Guatemala City', 'Mixco', 'Villa Nueva'],
    experiences: ['Guatemala City Tour', 'La Aurora Airport']
  },
  {
    id: 'sacatepequez',
    name: 'Sacatepéquez',
    coordinates: [14.5614, -90.7345],
    color: '#f59e0b',
    airports: [],
    destinations: ['Antigua Guatemala', 'Ciudad Vieja', 'San Lucas'],
    experiences: ['Antigua Colonial Tour', 'Coffee Plantation Tour', 'Pacaya Volcano Adventure']
  },
  {
    id: 'solola',
    name: 'Sololá',
    coordinates: [14.7727, -91.1825],
    color: '#10b981',
    airports: [],
    destinations: ['Panajachel', 'San Pedro La Laguna', 'Santiago Atitlán'],
    experiences: ['Lake Atitlán Scenic Flight', 'Mayan Village Cultural Tour', 'Sunset Champagne Flight']
  },
  {
    id: 'peten',
    name: 'Petén',
    coordinates: [16.9131, -89.8907],
    color: '#3b82f6',
    airports: [
      { name: 'Mundo Maya International Airport', code: 'FRS', type: 'international', coordinates: [16.9138, -89.8664] }
    ],
    destinations: ['Flores', 'Tikal', 'Yaxha', 'El Remate'],
    experiences: ['Tikal Ruins Expedition', 'Yaxha Archaeological Tour', 'Sunrise Over the Rainforest']
  },
  {
    id: 'izabal',
    name: 'Izabal',
    coordinates: [15.5374, -88.9908],
    color: '#8b5cf6',
    airports: [
      { name: 'Puerto Barrios Airport', code: 'PBR', type: 'regional', coordinates: [15.7306, -88.5839] }
    ],
    destinations: ['Puerto Barrios', 'Río Dulce', 'Livingston', 'El Estor'],
    experiences: ['Río Dulce Canyon Flight', 'Caribbean Coast Explorer']
  },
  {
    id: 'quetzaltenango',
    name: 'Quetzaltenango',
    coordinates: [14.8455, -91.5186],
    color: '#ec4899',
    airports: [],
    destinations: ['Quetzaltenango', 'Zunil', 'Almolonga'],
    experiences: ['Xela Highland Tour', 'Volcano Chain Flight']
  },
  {
    id: 'retalhuleu',
    name: 'Retalhuleu',
    coordinates: [14.5374, -91.6774],
    color: '#14b8a6',
    airports: [
      { name: 'Retalhuleu Airport', code: 'RER', type: 'regional', coordinates: [14.5211, -91.6972] }
    ],
    destinations: ['Retalhuleu', 'Champerico', 'El Asintal'],
    experiences: ['Pacific Coast Sunset', 'Beach Landing Experience']
  },
  {
    id: 'alta-verapaz',
    name: 'Alta Verapaz',
    coordinates: [15.4733, -90.3711],
    color: '#f97316',
    airports: [
      { name: 'Cobán Airport', code: 'CBV', type: 'regional', coordinates: [15.4689, -90.4067] }
    ],
    destinations: ['Cobán', 'Lanquín', 'Semuc Champey'],
    experiences: ['Semuc Champey Paradise Tour', 'Cloud Forest Adventure']
  },
  {
    id: 'huehuetenango',
    name: 'Huehuetenango',
    coordinates: [15.3199, -91.4709],
    color: '#06b6d4',
    airports: [
      { name: 'Huehuetenango Airport', code: 'HUG', type: 'regional', coordinates: [15.3272, -91.4628] }
    ],
    destinations: ['Huehuetenango', 'Todos Santos', 'Nentón'],
    experiences: ['Sierra de los Cuchumatanes Flight']
  },
  {
    id: 'escuintla',
    name: 'Escuintla',
    coordinates: [14.3050, -90.7852],
    color: '#84cc16',
    airports: [],
    destinations: ['Escuintla', 'Puerto San José', 'Monterrico'],
    experiences: ['Volcano Triple Tour (Fuego, Acatenango, Agua)']
  },
  {
    id: 'san-marcos',
    name: 'San Marcos',
    coordinates: [14.9639, -91.7944],
    color: '#a855f7',
    airports: [],
    destinations: ['San Marcos', 'San Pedro Sacatepéquez', 'Malacatán'],
    experiences: ['Tajumulco Volcano Expedition']
  },
  {
    id: 'chimaltenango',
    name: 'Chimaltenango',
    coordinates: [14.6611, -90.8192],
    color: '#ef4444',
    airports: [],
    destinations: ['Chimaltenango', 'San Martín Jilotepeque', 'Patzún'],
    experiences: ['Acatenango Volcano View']
  },
  {
    id: 'zacapa',
    name: 'Zacapa',
    coordinates: [14.9722, -89.5306],
    color: '#f59e0b',
    airports: [
      { name: 'Zacapa Airport', code: 'ZAC', type: 'regional', coordinates: [14.9650, -89.5281] }
    ],
    destinations: ['Zacapa', 'Estanzuela', 'Río Hondo'],
    experiences: ['Sierra de las Minas Exploration']
  },
  {
    id: 'chiquimula',
    name: 'Chiquimula',
    coordinates: [14.8000, -89.5456],
    color: '#10b981',
    airports: [],
    destinations: ['Chiquimula', 'Esquipulas', 'Jocotán'],
    experiences: ['Esquipulas Pilgrimage Flight']
  },
  {
    id: 'jalapa',
    name: 'Jalapa',
    coordinates: [14.6333, -89.9833],
    color: '#3b82f6',
    airports: [],
    destinations: ['Jalapa', 'Monjas', 'Mataquescuintla'],
    experiences: ['Eastern Highlands Tour']
  },
  {
    id: 'santa-rosa',
    name: 'Santa Rosa',
    coordinates: [14.1675, -90.3875],
    color: '#8b5cf6',
    airports: [],
    destinations: ['Cuilapa', 'Barberena', 'Guazacapán'],
    experiences: ['Ayarza Lagoon Scenic Flight']
  },
  {
    id: 'baja-verapaz',
    name: 'Baja Verapaz',
    coordinates: [15.1056, -90.3164],
    color: '#ec4899',
    airports: [],
    destinations: ['Salamá', 'Rabinal', 'Cubulco'],
    experiences: ['Biotopo del Quetzal Tour']
  },
  {
    id: 'jutiapa',
    name: 'Jutiapa',
    coordinates: [14.2917, -89.8958],
    color: '#14b8a6',
    airports: [],
    destinations: ['Jutiapa', 'Asunción Mita', 'Atescatempa'],
    experiences: ['Border Volcanoes Tour']
  },
  {
    id: 'el-progreso',
    name: 'El Progreso',
    coordinates: [14.8556, -90.0750],
    color: '#f97316',
    airports: [],
    destinations: ['Guastatoya', 'Sanarate', 'Morazán'],
    experiences: ['Motagua Valley Flight']
  },
  {
    id: 'totonicapan',
    name: 'Totonicapán',
    coordinates: [14.9111, -91.3611],
    color: '#06b6d4',
    airports: [],
    destinations: ['Totonicapán', 'San Cristóbal', 'San Francisco El Alto'],
    experiences: ['Indigenous Markets Tour']
  },
  {
    id: 'quiche',
    name: 'Quiché',
    coordinates: [15.0308, -91.1486],
    color: '#84cc16',
    airports: [
      { name: 'Quiché Airport', code: 'AAZ', type: 'regional', coordinates: [15.0122, -91.1508] }
    ],
    destinations: ['Santa Cruz del Quiché', 'Chichicastenango', 'Nebaj'],
    experiences: ['Ixil Triangle Cultural Flight', 'Chichicastenango Market Day']
  },
  {
    id: 'suchitepequez',
    name: 'Suchitepéquez',
    coordinates: [14.5356, -91.4019],
    color: '#a855f7',
    airports: [],
    destinations: ['Mazatenango', 'San Antonio', 'Chicacao'],
    experiences: ['Pacific Lowlands Agricultural Tour']
  }
]

// Helper function to get department by ID
export const getDepartmentById = (id: string): Department | undefined => {
  return guatemalaDepartments.find(dept => dept.id === id)
}

// Helper function to get all airports
export const getAllAirports = (): Airport[] => {
  return guatemalaDepartments.flatMap(dept => dept.airports)
}

// Helper function to get departments with airports
export const getDepartmentsWithAirports = (): Department[] => {
  return guatemalaDepartments.filter(dept => dept.airports.length > 0)
}

// Helper function to search destinations
export const searchDestinations = (query: string): Department[] => {
  const lowercaseQuery = query.toLowerCase()
  return guatemalaDepartments.filter(dept => 
    dept.destinations.some(dest => dest.toLowerCase().includes(lowercaseQuery)) ||
    dept.name.toLowerCase().includes(lowercaseQuery)
  )
}