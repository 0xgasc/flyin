import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { extractToken, verifyToken } from '@/lib/jwt'
import mongoose from 'mongoose'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Get single booking by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    await connectDB()

    const booking = await Booking.findById(id)
      .populate('clientId', 'email fullName phone')
      .populate('pilotId', 'email fullName')
      .populate('experienceId', 'name description basePrice')
      .lean()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check ownership (unless admin)
    const b = booking as any
    if (payload.role !== 'admin' &&
        b.clientId?._id?.toString() !== payload.userId &&
        b.pilotId?._id?.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      booking: {
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
          description: b.experienceId.description,
          base_price: b.experienceId.basePrice
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
        created_at: b.createdAt
      }
    })
  } catch (error: any) {
    console.error('Get booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update booking
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    await connectDB()

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check ownership (unless admin/pilot)
    const isOwner = booking.clientId.toString() === payload.userId
    const isPilotAssigned = booking.pilotId?.toString() === payload.userId
    const isAdmin = payload.role === 'admin'
    const isPilot = payload.role === 'pilot'

    if (!isOwner && !isAdmin && !(isPilot && isPilotAssigned)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const allowedUpdates: Record<string, string[]> = {
      client: ['notes', 'status', 'passenger_details', 'selected_addons', 'addon_total_price'], // clients can update passenger details
      pilot: ['status', 'admin_notes'],
      admin: ['status', 'pilot_id', 'admin_notes', 'total_price', 'payment_status', 'helicopter_id',
              'from_location', 'to_location', 'scheduled_date', 'scheduled_time',
              'return_date', 'return_time', 'is_round_trip', 'passenger_count',
              'revision_requested', 'revision_notes', 'revision_data']
    }

    const updates: any = {}
    const userAllowed = isAdmin ? allowedUpdates.admin :
                        (isPilot && isPilotAssigned) ? allowedUpdates.pilot :
                        allowedUpdates.client

    // Clients can only cancel pending bookings
    if (!isAdmin && !isPilot && body.status === 'cancelled' && booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending bookings' },
        { status: 400 }
      )
    }

    // Map snake_case to camelCase
    const fieldMapping: Record<string, string> = {
      status: 'status',
      notes: 'notes',
      admin_notes: 'adminNotes',
      pilot_id: 'pilotId',
      total_price: 'totalPrice',
      payment_status: 'paymentStatus',
      helicopter_id: 'helicopterId',
      from_location: 'fromLocation',
      to_location: 'toLocation',
      scheduled_date: 'scheduledDate',
      scheduled_time: 'scheduledTime',
      return_date: 'returnDate',
      return_time: 'returnTime',
      is_round_trip: 'isRoundTrip',
      passenger_count: 'passengerCount',
      passenger_details: 'passengerDetails',
      selected_addons: 'selectedAddons',
      addon_total_price: 'addonTotalPrice',
      revision_requested: 'revisionRequested',
      revision_notes: 'revisionNotes',
      revision_data: 'revisionData'
    }

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (body[key] !== undefined && userAllowed.includes(key)) {
        if (key === 'pilot_id' && body[key]) {
          updates[dbField] = new mongoose.Types.ObjectId(body[key])
        } else {
          updates[dbField] = body[key]
        }
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking!._id.toString(),
        status: updatedBooking!.status,
        payment_status: updatedBooking!.paymentStatus
      }
    })
  } catch (error: any) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Cancel/delete booking (admin only for delete, users can cancel)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    await connectDB()

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Admins can delete, others can only cancel if pending
    if (payload.role === 'admin') {
      await Booking.findByIdAndDelete(id)
      return NextResponse.json({ success: true, message: 'Booking deleted' })
    }

    // Non-admins: check ownership and only allow cancelling pending
    if (booking.clientId.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending bookings' },
        { status: 400 }
      )
    }

    booking.status = 'cancelled'
    await booking.save()

    return NextResponse.json({ success: true, message: 'Booking cancelled' })
  } catch (error: any) {
    console.error('Delete booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
