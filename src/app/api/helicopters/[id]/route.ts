import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Helicopter } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - Get single helicopter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    const helicopter = await Helicopter.findById(id).lean()

    if (!helicopter) {
      return NextResponse.json({ error: 'Helicopter not found' }, { status: 404 })
    }

    const h = helicopter as any
    return NextResponse.json({
      success: true,
      helicopter: {
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
        image_url: h.imageUrl
      }
    })
  } catch (error: any) {
    console.error('Get helicopter error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update helicopter (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    await connectDB()

    const body = await request.json()
    const updates: any = {}

    // Map snake_case API fields to camelCase model fields
    if (body.name !== undefined) updates.name = body.name
    if (body.model !== undefined) updates.helicopterModel = body.model
    if (body.manufacturer !== undefined) updates.manufacturer = body.manufacturer
    if (body.year_manufactured !== undefined) updates.yearManufactured = body.year_manufactured
    if (body.registration_number !== undefined) updates.registrationNumber = body.registration_number
    if (body.capacity !== undefined) updates.capacity = body.capacity
    if (body.hourly_rate !== undefined) updates.hourlyRate = body.hourly_rate
    if (body.max_range_km !== undefined) updates.maxRangeKm = body.max_range_km
    if (body.cruise_speed_kmh !== undefined) updates.cruiseSpeedKmh = body.cruise_speed_kmh
    if (body.fuel_capacity_liters !== undefined) updates.fuelCapacityLiters = body.fuel_capacity_liters
    if (body.fuel_consumption_lph !== undefined) updates.fuelConsumptionLph = body.fuel_consumption_lph
    if (body.total_flight_hours !== undefined) updates.totalFlightHours = body.total_flight_hours
    if (body.last_maintenance_date !== undefined) updates.lastMaintenanceDate = body.last_maintenance_date
    if (body.next_maintenance_due !== undefined) updates.nextMaintenanceDue = body.next_maintenance_due
    if (body.status !== undefined) updates.status = body.status
    if (body.location !== undefined) updates.location = body.location
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.image_url !== undefined) updates.imageUrl = body.image_url

    const helicopter = await Helicopter.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean()

    if (!helicopter) {
      return NextResponse.json({ error: 'Helicopter not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Helicopter updated successfully'
    })
  } catch (error: any) {
    console.error('Update helicopter error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete helicopter (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    await connectDB()

    const result = await Helicopter.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ error: 'Helicopter not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Helicopter deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete helicopter error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
