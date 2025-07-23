// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Known coordinates for major locations in Guatemala
export const LOCATION_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'MGGT': { lat: 14.5833, lng: -90.5275, name: 'Guatemala City (La Aurora)' },
  'GUA': { lat: 14.5833, lng: -90.5275, name: 'Guatemala City (La Aurora)' },
  'FRS': { lat: 16.9138, lng: -89.8664, name: 'Flores (Mundo Maya)' },
  'MGCB': { lat: 15.4689, lng: -90.4067, name: 'Coban Airport' },
  'MGQZ': { lat: 14.8656, lng: -91.5019, name: 'Quetzaltenango Airport' },
  'PBR': { lat: 15.7306, lng: -88.5836, name: 'Puerto Barrios Airport' },
  'RER': { lat: 14.5211, lng: -91.6972, name: 'Retalhuleu Airport' },
  'CUSTOM001': { lat: 14.5586, lng: -90.7339, name: 'Antigua Helipad' },
  'CUSTOM002': { lat: 14.7406, lng: -91.1581, name: 'Lake Atitlán Landing' },
  'CUSTOM003': { lat: 17.2222, lng: -89.6228, name: 'Tikal Airstrip' },
  'CUSTOM004': { lat: 15.5333, lng: -89.9667, name: 'Semuc Champey Landing' },
  
  // Additional major cities and tourist destinations
  'ANTIGUA': { lat: 14.5586, lng: -90.7339, name: 'Antigua Guatemala' },
  'ATITLAN': { lat: 14.7406, lng: -91.1581, name: 'Lake Atitlán' },
  'TIKAL': { lat: 17.2222, lng: -89.6228, name: 'Tikal National Park' },
  'XELA': { lat: 14.8656, lng: -91.5019, name: 'Quetzaltenango (Xela)' },
  'SEMUC': { lat: 15.5333, lng: -89.9667, name: 'Semuc Champey' },
  'LIVINGSTON': { lat: 15.8292, lng: -88.7500, name: 'Livingston' },
  'MONTERRICO': { lat: 13.9333, lng: -90.8333, name: 'Monterrico Beach' },
  'COBAN': { lat: 15.4689, lng: -90.4067, name: 'Cobán' },
  'HUEHUE': { lat: 15.3197, lng: -91.4711, name: 'Huehuetenango' },
  'ESCUINTLA': { lat: 14.3056, lng: -90.7850, name: 'Escuintla' }
}

export function getDistanceBetweenLocations(from: string, to: string): number {
  const fromCoords = LOCATION_COORDINATES[from.toUpperCase()]
  const toCoords = LOCATION_COORDINATES[to.toUpperCase()]
  
  if (!fromCoords || !toCoords) {
    // Return a default distance if coordinates not found
    return 100 // Default 100km
  }
  
  return calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng)
}

export function calculateFlightTime(distanceKm: number, helicopterSpeed: number = 180): number {
  // Average helicopter cruise speed is around 180 km/h
  // Add 20% for takeoff, landing, and navigation time
  return (distanceKm / helicopterSpeed) * 1.2
}

export function calculateTransportPrice(
  distanceKm: number,
  helicopterHourlyRate: number,
  passengers: number = 1
): {
  distance: number
  flightTime: number
  basePrice: number
  passengerFee: number
  totalPrice: number
} {
  const flightTime = calculateFlightTime(distanceKm)
  const basePrice = helicopterHourlyRate * flightTime
  
  // Add passenger fee for more than 1 passenger (20% per additional passenger)
  const additionalPassengers = Math.max(0, passengers - 1)
  const passengerFee = basePrice * additionalPassengers * 0.2
  
  const totalPrice = basePrice + passengerFee
  
  return {
    distance: Math.round(distanceKm),
    flightTime: Math.round(flightTime * 60), // in minutes
    basePrice: Math.round(basePrice),
    passengerFee: Math.round(passengerFee),
    totalPrice: Math.round(totalPrice)
  }
}

// Parse custom location input and try to get coordinates
export function parseCustomLocation(input: string): { lat: number; lng: number; name: string } | null {
  // Try to match with known locations first
  const upperInput = input.toUpperCase()
  const knownLocation = LOCATION_COORDINATES[upperInput]
  if (knownLocation) {
    return knownLocation
  }
  
  // Check if input contains coordinates (format: "Name (lat, lng)")
  const coordMatch = input.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    const name = input.replace(coordMatch[0], '').trim()
    return { lat, lng, name }
  }
  
  return null
}