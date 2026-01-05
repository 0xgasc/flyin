import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Airport from '@/models/Airport'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List all airports (public)
export async function GET() {
  try {
    await connectDB()

    const airports = await Airport.find()
      .sort({ city: 1, name: 1 })
      .lean()

    const transformedAirports = airports.map((a: any) => ({
      id: a._id.toString(),
      code: a.code,
      name: a.name,
      city: a.city,
      latitude: a.latitude,
      longitude: a.longitude,
      is_custom: a.isCustom
    }))

    return NextResponse.json({
      success: true,
      airports: transformedAirports
    })
  } catch (error: any) {
    console.error('Get airports error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create airport (admin only)
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
    const { code, name, city, latitude, longitude, is_custom } = body

    if (!code || !name || !city || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for duplicate code
    const existing = await Airport.findOne({ code: code.toUpperCase() })
    if (existing) {
      return NextResponse.json(
        { error: 'Airport code already exists' },
        { status: 400 }
      )
    }

    const airport = new Airport({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      city: city.trim(),
      latitude,
      longitude,
      isCustom: is_custom ?? true
    })

    await airport.save()

    return NextResponse.json({
      success: true,
      airport: {
        id: airport._id.toString(),
        code: airport.code,
        name: airport.name,
        city: airport.city,
        latitude: airport.latitude,
        longitude: airport.longitude,
        is_custom: airport.isCustom
      }
    })
  } catch (error: any) {
    console.error('Create airport error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
