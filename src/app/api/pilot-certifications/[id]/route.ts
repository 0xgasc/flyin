import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { PilotAircraftCertification } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// PATCH - Update certification (admin only)
export async function PATCH(
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid certification ID' }, { status: 400 })
    }

    await connectDB()

    const body = await request.json()
    const updates: any = {}

    if (body.flight_hours !== undefined) updates.flightHours = body.flight_hours
    if (body.status !== undefined) updates.status = body.status
    if (body.certified_since !== undefined) updates.certifiedSince = body.certified_since
    if (body.notes !== undefined) updates.notes = body.notes

    const certification = await PilotAircraftCertification.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
      .populate('pilotId', 'fullName email')
      .populate('helicopterId', 'name helicopterModel registrationNumber')
      .lean()

    if (!certification) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 })
    }

    const c: any = certification
    const pilot = c.pilotId && typeof c.pilotId === 'object' ? c.pilotId : null
    const heli = c.helicopterId && typeof c.helicopterId === 'object' ? c.helicopterId : null

    return NextResponse.json({
      success: true,
      certification: {
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
        notes: c.notes
      }
    })
  } catch (error: any) {
    console.error('Update certification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove certification (admin only)
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid certification ID' }, { status: 400 })
    }

    await connectDB()

    const deleted = await PilotAircraftCertification.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete certification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
