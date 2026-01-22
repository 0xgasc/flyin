import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Booking, User, Transaction } from '@/models'
import { verifyToken } from '@/lib/jwt'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await User.findById(decoded.userId)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectToDatabase()

    const body = await req.json()
    const { amount, reason, refundMethod = 'original' } = body

    const booking: any = await Booking.findById(id).populate('user_id')
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Validation
    if (booking.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Booking has not been paid yet' },
        { status: 400 }
      )
    }

    if (booking.refund_status === 'refunded') {
      return NextResponse.json(
        { success: false, error: 'Booking has already been refunded' },
        { status: 400 }
      )
    }

    const refundAmount = amount || booking.final_price

    if (refundAmount > booking.final_price) {
      return NextResponse.json(
        { success: false, error: 'Refund amount cannot exceed booking price' },
        { status: 400 }
      )
    }

    // Create refund transaction
    const refundTransaction = await Transaction.create({
      userId: booking.user_id._id,
      bookingId: booking._id,
      amount: refundAmount,
      type: 'refund',
      status: 'completed',
      paymentMethod: refundMethod === 'wallet' ? 'account_balance' : 'bank_transfer',
      reference: `Refund: ${booking._id}${reason ? ' - ' + reason : ''}`
    })

    // Update booking
    booking.refund_status = refundAmount >= booking.final_price ? 'refunded' : 'partial_refund'
    booking.refund_amount = (booking.refund_amount || 0) + refundAmount
    booking.refund_reason = reason
    booking.refund_date = new Date()
    booking.status = 'cancelled'

    await booking.save()

    // TODO: Update user balance if refund method is wallet
    // Note: User model doesn't currently have wallet_balance field
    // if (refundMethod === 'wallet') {
    //   const customer = await User.findById(booking.user_id._id)
    //   if (customer) {
    //     customer.wallet_balance = (customer.wallet_balance || 0) + refundAmount
    //     await customer.save()
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        bookingId: booking._id,
        amount: refundAmount,
        method: refundMethod,
        transactionId: refundTransaction._id,
        status: booking.refund_status,
        totalRefunded: booking.refund_amount
      }
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}

// Get refund status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const booking: any = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (user.role !== 'admin' && booking.user_id.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      refund: {
        status: booking.refund_status || 'none',
        amount: booking.refund_amount || 0,
        reason: booking.refund_reason,
        date: booking.refund_date,
        totalPrice: booking.final_price,
        remainingAmount: booking.final_price - (booking.refund_amount || 0)
      }
    })
  } catch (error) {
    console.error('Error fetching refund status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refund status' },
      { status: 500 }
    )
  }
}
