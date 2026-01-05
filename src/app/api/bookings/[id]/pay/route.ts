import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Booking from '@/models/Booking'
import User from '@/models/User'
import Transaction from '@/models/Transaction'
import { getAuthUser } from '@/lib/auth-middleware'

// POST /api/bookings/[id]/pay - Pay for a booking
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { paymentMethod, reference } = body

    await connectToDatabase()

    // Get the booking
    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    // Verify ownership
    if (booking.clientId.toString() !== authUser.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ success: false, error: 'Booking already paid' }, { status: 400 })
    }

    const amount = booking.totalPrice

    if (paymentMethod === 'account_balance') {
      // Get user and check balance
      const user = await User.findById(authUser.userId)
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      if ((user.accountBalance || 0) < amount) {
        return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 })
      }

      // Deduct from balance
      user.accountBalance = (user.accountBalance || 0) - amount
      await user.save()

      // Update booking payment status
      booking.paymentStatus = 'paid'
      await booking.save()

      // Create transaction record
      await Transaction.create({
        userId: authUser.userId,
        bookingId: booking._id,
        type: 'payment',
        amount: -amount,
        paymentMethod: 'account_balance',
        status: 'completed',
        reference: reference || `Flight payment - Booking ${id}`
      })

      return NextResponse.json({
        success: true,
        message: 'Payment successful',
        newBalance: user.accountBalance
      })
    } else if (paymentMethod === 'bank_transfer') {
      // For bank transfer, set status to processing and create pending transaction
      booking.paymentStatus = 'processing'
      await booking.save()

      await Transaction.create({
        userId: authUser.userId,
        bookingId: booking._id,
        type: 'payment',
        amount: amount,
        paymentMethod: 'bank_transfer',
        status: 'pending',
        reference: reference || `Booking payment - ${id}`
      })

      return NextResponse.json({
        success: true,
        message: 'Bank transfer initiated'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported payment method' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Payment error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
