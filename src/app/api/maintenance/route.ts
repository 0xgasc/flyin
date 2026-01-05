import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { MaintenanceRecord, Helicopter } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List all maintenance records
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
    const helicopterId = searchParams.get('helicopter_id')

    const query: any = {}
    if (helicopterId) {
      query.helicopterId = helicopterId
    }

    const records = await MaintenanceRecord.find(query)
      .populate('helicopterId', 'name registrationNumber')
      .sort({ startDate: -1 })
      .lean()

    const transformedRecords = records.map((r: any) => ({
      id: r._id.toString(),
      helicopter_id: r.helicopterId?._id?.toString() || null,
      helicopter: r.helicopterId ? {
        name: r.helicopterId.name,
        registration_number: r.helicopterId.registrationNumber
      } : null,
      type: r.type,
      description: r.description,
      start_date: r.startDate,
      end_date: r.endDate,
      status: r.status,
      cost: r.cost,
      technician: r.technician,
      notes: r.notes,
      parts_replaced: r.partsReplaced,
      next_scheduled_maintenance: r.nextScheduledMaintenance,
      created_at: r.createdAt
    }))

    return NextResponse.json({
      success: true,
      records: transformedRecords
    })
  } catch (error: any) {
    console.error('Get maintenance records error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create maintenance record (admin only)
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
      helicopter_id, type, description, start_date,
      end_date, status, cost, technician, notes, parts_replaced
    } = body

    if (!helicopter_id || !type || !description || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify helicopter exists
    const helicopter = await Helicopter.findById(helicopter_id)
    if (!helicopter) {
      return NextResponse.json({ error: 'Helicopter not found' }, { status: 404 })
    }

    const record = new MaintenanceRecord({
      helicopterId: helicopter_id,
      type,
      description,
      startDate: new Date(start_date),
      endDate: end_date ? new Date(end_date) : null,
      status: status || 'scheduled',
      cost: cost || 0,
      technician: technician || null,
      notes: notes || null,
      partsReplaced: parts_replaced || []
    })

    await record.save()

    // Update helicopter status if maintenance is in progress
    if (status === 'in_progress') {
      await Helicopter.findByIdAndUpdate(helicopter_id, { status: 'maintenance' })
    }

    return NextResponse.json({
      success: true,
      record: {
        id: record._id.toString(),
        type: record.type,
        status: record.status
      }
    })
  } catch (error: any) {
    console.error('Create maintenance record error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
