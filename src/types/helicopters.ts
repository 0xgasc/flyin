export interface Helicopter {
  id: string
  name: string
  model: string
  capacity: number
  hourly_rate: number
  description: string
  features: string[]
  image_url?: string
  is_available: boolean
}

export const HELICOPTER_FLEET: Helicopter[] = [
  {
    id: 'robinson-r44',
    name: 'Robinson R44',
    model: 'R44 Raven II',
    capacity: 3,
    hourly_rate: 1200,
    description: 'Perfect for scenic tours and short transfers',
    features: ['3 passengers', 'Excellent visibility', 'Cost effective', 'Ideal for tours'],
    is_available: true
  },
  {
    id: 'bell-206',
    name: 'Bell 206 JetRanger',
    model: 'Bell 206B-3',
    capacity: 4,
    hourly_rate: 1800,
    description: 'Premium comfort and reliability',
    features: ['4 passengers', 'Turbine engine', 'Smooth flight', 'Professional standard'],
    is_available: true
  },
  {
    id: 'airbus-h125',
    name: 'Airbus H125',
    model: 'H125 Ecureuil',
    capacity: 5,
    hourly_rate: 2200,
    description: 'High performance for challenging destinations',
    features: ['5 passengers', 'High altitude capable', 'Advanced avionics', 'Luxury interior'],
    is_available: true
  },
  {
    id: 'bell-407',
    name: 'Bell 407',
    model: 'Bell 407GXi',
    capacity: 6,
    hourly_rate: 2800,
    description: 'Ultimate luxury and space for larger groups',
    features: ['6 passengers', 'Spacious cabin', 'Premium comfort', 'Executive transport'],
    is_available: true
  }
]