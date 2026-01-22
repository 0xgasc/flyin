import { NextRequest, NextResponse } from 'next/server'

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Pricing tiers based on distance
const PRICING_TIERS = [
  { maxKm: 50, basePrice: 300, perKm: 5 },      // Short flights
  { maxKm: 150, basePrice: 500, perKm: 4 },     // Medium flights
  { maxKm: 300, basePrice: 800, perKm: 3.5 },   // Long flights
  { maxKm: Infinity, basePrice: 1200, perKm: 3 } // Very long flights
]

// Known coordinates for major destinations
const DESTINATION_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  GUA: { lat: 14.5833, lon: -90.5275, name: 'Guatemala City' },
  ANTIGUA: { lat: 14.5586, lon: -90.7339, name: 'Antigua Guatemala' },
  ATITLAN: { lat: 14.6906, lon: -91.2025, name: 'Lake Atitlan' },
  TIKAL: { lat: 17.2221, lon: -89.6236, name: 'Tikal' },
  FRS: { lat: 16.9183, lon: -89.8942, name: 'Flores' },
  SEMUC: { lat: 15.4839, lon: -90.2311, name: 'Semuc Champey' },
  MONTERRICO: { lat: 13.9333, lon: -90.8333, name: 'Monterrico Beach' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { from, to, passengers = 1, roundTrip = false } = body

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: 'Missing from/to locations' },
        { status: 400 }
      )
    }

    // Get coordinates
    const fromCoords = DESTINATION_COORDS[from]
    const toCoords = DESTINATION_COORDS[to]

    if (!fromCoords || !toCoords) {
      return NextResponse.json(
        { success: false, error: 'Invalid destination code' },
        { status: 400 }
      )
    }

    // Calculate distance
    const distance = calculateDistance(
      fromCoords.lat,
      fromCoords.lon,
      toCoords.lat,
      toCoords.lon
    )

    // Find pricing tier
    const tier = PRICING_TIERS.find(t => distance <= t.maxKm) || PRICING_TIERS[PRICING_TIERS.length - 1]

    // Calculate base price
    let basePrice = tier.basePrice + (distance * tier.perKm)

    // Round trip modifier (10% discount)
    if (roundTrip) {
      basePrice = basePrice * 2 * 0.9
    }

    // Passenger modifier (additional 20% per passenger after first)
    const passengerModifier = 1 + ((passengers - 1) * 0.2)
    const totalPrice = Math.round(basePrice * passengerModifier)

    return NextResponse.json({
      success: true,
      pricing: {
        from: fromCoords.name,
        to: toCoords.name,
        distance: Math.round(distance),
        distanceUnit: 'km',
        passengers,
        roundTrip,
        basePrice: Math.round(basePrice),
        totalPrice,
        pricePerPassenger: Math.round(totalPrice / passengers),
        breakdown: {
          tierBasePrice: tier.basePrice,
          perKmRate: tier.perKm,
          distanceCost: Math.round(distance * tier.perKm),
          passengerModifier: passengers > 1 ? `+${((passengers - 1) * 20)}%` : 'N/A',
          roundTripDiscount: roundTrip ? '-10%' : 'N/A'
        }
      }
    })
  } catch (error) {
    console.error('Error calculating pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate pricing' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Return available destinations
  const destinations = Object.entries(DESTINATION_COORDS).map(([code, data]) => ({
    code,
    name: data.name,
    lat: data.lat,
    lon: data.lon
  }))

  return NextResponse.json({
    success: true,
    destinations,
    pricingTiers: PRICING_TIERS.map(t => ({
      maxKm: t.maxKm === Infinity ? 'Unlimited' : t.maxKm,
      basePrice: t.basePrice,
      perKm: t.perKm
    }))
  })
}
