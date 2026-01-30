import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { PilotAircraftCertification, User, Helicopter } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET - List certifications (admin only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const pilotId = searchParams.get('pilot_id')
    const helicopterId = searchParams.get('helicopter_id')
    const status = searchParams.get('status')

    const query: any = {}
    if (pilotId && mongoose.Types.ObjectId.isValid(pilotId)) {
      query.pilotId = pilotId
    }
    if (helicopterId && mongoose.Types.ObjectId.isValid(helicopterId)) {
      query.helicopterId = helicopterId
    }
    if (status) {
      query.status = status
    }

    const certifications = await PilotAircraftCertification.find(query)
      .populate('pilotId', 'fullName email')
      .populate('helicopterId', 'name helicopterModel registrationNumber')
      .sort({ certifiedSince: -1 })
      .lean()

    const transformed = certifications.map((c: any) => {
      const pilot = c.pilotId && typeof c.pilotId === 'object' ? c.pilotId : null
      const heli = c.helicopterId && typeof c.helicopterId === 'object' ? c.helicopterId : null

      return {
        id: c._id.toString(),
        pilot_id: pilot ? pilot._id.toString() : c.pilotId?.toString(),
        pilot: pilot ? {
          id: pilot._id.toString(),
          full_name: pilot.fullName,
          email: pilot.email
        } : null,
        helicopter_id: heli ? heli._id.toString() : c.helicopterId?.toString(),
        helicopter: heli ? {
          id: heli._id.toString(),
          name: heli.name,
          model: heli.helicopterModel,
          registration_number: heli.registrationNumber
        } : null,
        certified_since: c.certifiedSince,
        flight_hours: c.flightHours,
        status: c.status,
        notes: c.notes,
        created_at: c.createdAt
      }
    })

    return NextResponse.json({ success: true, certifications: transformed })
  } catch (error: any) {
    console.error('Get certifications error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create certification (admin only)
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
    const { pilot_id, helicopter_id, certified_since, flight_hours, notes } = body

    if (!pilot_id || !helicopter_id) {
      return NextResponse.json({ error: 'pilot_id and helicopter_id are required' }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(pilot_id) || !mongoose.Types.ObjectId.isValid(helicopter_id)) {
      return NextResponse.json({ error: 'Invalid pilot or helicopter ID' }, { status: 400 })
    }

    // Verify pilot exists and has pilot role
    const pilot = await User.findById(pilot_id).lean()
    if (!pilot || (pilot as any).role !== 'pilot') {
      return NextResponse.json({ error: 'Pilot not found or user is not a pilot' }, { status: 404 })
    }

    // Verify helicopter exists
    const helicopter = await Helicopter.findById(helicopter_id).lean()
    if (!helicopter) {
      return NextResponse.json({ error: 'Helicopter not found' }, { status: 404 })
    }

    const certification = new PilotAircraftCertification({
      pilotId: pilot_id,
      helicopterId: helicopter_id,
      certifiedSince: certified_since || new Date(),
      flightHours: flight_hours || 0,
      notes: notes || null
    })

    await certification.save()

    return NextResponse.json({
      success: true,
      certification: {
        id: certification._id.toString(),
        pilot_id: pilot_id,
        helicopter_id: helicopter_id,
        certified_since: certification.certifiedSince,
        flight_hours: certification.flightHours,
        status: certification.status,
        notes: certification.notes
      }
    })
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Certification already exists for this pilot-helicopter pair' },
        { status: 409 }
      )
    }
    console.error('Create certification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
