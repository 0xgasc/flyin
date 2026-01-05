import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { extractToken, verifyToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET - List bookings for current user (or all for admin)
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const bookingType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    const query: any = {}

    // Non-admins can only see their own bookings
    if (payload.role !== 'admin') {
      if (payload.role === 'pilot') {
        query.$or = [
          { clientId: payload.userId },
          { pilotId: payload.userId }
        ]
      } else {
        query.clientId = payload.userId
      }
    }

    if (status) query.status = status
    if (bookingType) query.bookingType = bookingType

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('clientId', 'email fullName phone')
        .populate('pilotId', 'email fullName')
        .populate('experienceId', 'name description')
        .lean(),
      Booking.countDocuments(query)
    ])

    // Transform for API response
    const transformedBookings = bookings.map((b: any) => ({
      id: b._id.toString(),
      client_id: b.clientId?._id?.toString() || b.clientId,
      client: b.clientId ? {
        id: b.clientId._id?.toString(),
        email: b.clientId.email,
        full_name: b.clientId.fullName,
        phone: b.clientId.phone
      } : null,
      booking_type: b.bookingType,
      status: b.status,
      from_location: b.fromLocation,
      to_location: b.toLocation,
      experience_id: b.experienceId?._id?.toString() || b.experienceId,
      experience: b.experienceId ? {
        name: b.experienceId.name,
        description: b.experienceId.description
      } : null,
      experiences: b.experienceId ? {
        name: b.experienceId.name,
        location: b.experienceId.location || '',
        duration_hours: b.experienceId.durationHours || 0
      } : null,
      destination_id: b.destinationId?._id?.toString() || b.destinationId,
      scheduled_date: b.scheduledDate,
      scheduled_time: b.scheduledTime,
      return_date: b.returnDate,
      return_time: b.returnTime,
      is_round_trip: b.isRoundTrip,
      passenger_count: b.passengerCount,
      passenger_details: b.passengerDetails,
      selected_addons: b.selectedAddons,
      addon_total_price: b.addonTotalPrice,
      notes: b.notes,
      total_price: b.totalPrice,
      payment_status: b.paymentStatus,
      pilot_id: b.pilotId?._id?.toString() || b.pilotId,
      pilot: b.pilotId ? {
        id: b.pilotId._id?.toString(),
        email: b.pilotId.email,
        full_name: b.pilotId.fullName
      } : null,
      helicopter_id: b.helicopterId,
      admin_notes: b.adminNotes,
      revision_requested: b.revisionRequested,
      revision_notes: b.revisionNotes,
      revision_data: b.revisionData,
      created_at: b.createdAt,
      // Add profiles alias for backwards compatibility
      profiles: b.clientId ? {
        full_name: b.clientId.fullName,
        email: b.clientId.email,
        phone: b.clientId.phone
      } : null
    }))

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      total,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const {
      booking_type,
      from_location,
      to_location,
      experience_id,
      destination_id,
      scheduled_date,
      scheduled_time,
      return_date,
      return_time,
      is_round_trip,
      passenger_count,
      passenger_details,
      selected_addons,
      addon_total_price,
      notes,
      total_price
    } = body

    // Validate required fields
    if (!booking_type || !scheduled_date || !scheduled_time || total_price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const bookingDate = new Date(scheduled_date)
    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'Cannot book for past dates' },
        { status: 400 }
      )
    }

    // Validate return date if round trip
    let returnDateObj = null
    if (is_round_trip && return_date) {
      returnDateObj = new Date(return_date)
      if (returnDateObj < bookingDate) {
        return NextResponse.json(
          { error: 'Return date must be on or after departure date' },
          { status: 400 }
        )
      }
    }

    // Create booking
    const booking = new Booking({
      clientId: new mongoose.Types.ObjectId(payload.userId),
      bookingType: booking_type,
      fromLocation: from_location || null,
      toLocation: to_location || null,
      experienceId: experience_id ? new mongoose.Types.ObjectId(experience_id) : null,
      destinationId: destination_id ? new mongoose.Types.ObjectId(destination_id) : null,
      scheduledDate: bookingDate,
      scheduledTime: scheduled_time,
      returnDate: returnDateObj,
      returnTime: return_time || null,
      isRoundTrip: is_round_trip || false,
      passengerCount: passenger_count || 1,
      passengerDetails: passenger_details || [],
      selectedAddons: selected_addons || [],
      addonTotalPrice: addon_total_price || 0,
      notes: notes || null,
      totalPrice: total_price,
      status: 'pending',
      paymentStatus: 'pending'
    })

    await booking.save()

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id.toString(),
        client_id: booking.clientId.toString(),
        booking_type: booking.bookingType,
        status: booking.status,
        from_location: booking.fromLocation,
        to_location: booking.toLocation,
        experience_id: booking.experienceId?.toString(),
        scheduled_date: booking.scheduledDate,
        scheduled_time: booking.scheduledTime,
        passenger_count: booking.passengerCount,
        notes: booking.notes,
        total_price: booking.totalPrice,
        payment_status: booking.paymentStatus,
        created_at: booking.createdAt
      }
    })
  } catch (error: any) {
    console.error('Create booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
