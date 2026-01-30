import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Helicopter } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List all helicopters
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const helicopters = await Helicopter.find()
      .sort({ name: 1 })
      .lean()

    const transformedHelicopters = helicopters.map((h: any) => ({
      id: h._id.toString(),
      name: h.name,
      model: h.helicopterModel,
      manufacturer: h.manufacturer,
      year_manufactured: h.yearManufactured,
      registration_number: h.registrationNumber,
      capacity: h.capacity,
      hourly_rate: h.hourlyRate,
      max_range_km: h.maxRangeKm,
      cruise_speed_kmh: h.cruiseSpeedKmh,
      fuel_capacity_liters: h.fuelCapacityLiters,
      fuel_consumption_lph: h.fuelConsumptionLph,
      total_flight_hours: h.totalFlightHours,
      last_maintenance_date: h.lastMaintenanceDate,
      next_maintenance_due: h.nextMaintenanceDue,
      status: h.status,
      location: h.location,
      notes: h.notes,
      image_url: h.imageUrl,
      insurance_expiry: h.insuranceExpiry,
      created_at: h.createdAt
    }))

    return NextResponse.json({
      success: true,
      helicopters: transformedHelicopters
    })
  } catch (error: any) {
    console.error('Get helicopters error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create helicopter (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    const {
      name, model, manufacturer, year_manufactured, registration_number,
      capacity, hourly_rate, max_range_km, cruise_speed_kmh,
      fuel_capacity_liters, fuel_consumption_lph, location, notes
    } = body

    if (!name || !model || !manufacturer || !registration_number) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const helicopter = new Helicopter({
      name: name.trim(),
      helicopterModel: model,
      manufacturer,
      yearManufactured: year_manufactured || new Date().getFullYear(),
      registrationNumber: registration_number,
      capacity: capacity || 4,
      hourlyRate: hourly_rate || 600,
      maxRangeKm: max_range_km || 500,
      cruiseSpeedKmh: cruise_speed_kmh || 180,
      fuelCapacityLiters: fuel_capacity_liters || 200,
      fuelConsumptionLph: fuel_consumption_lph || 50,
      location: location || 'Guatemala City Base',
      notes: notes || null,
      status: 'active'
    })

    await helicopter.save()

    return NextResponse.json({
      success: true,
      helicopter: {
        id: helicopter._id.toString(),
        name: helicopter.name,
        model: helicopter.helicopterModel,
        manufacturer: helicopter.manufacturer,
        registration_number: helicopter.registrationNumber,
        status: helicopter.status
      }
    })
  } catch (error: any) {
    console.error('Create helicopter error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
