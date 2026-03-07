import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Booking, User, Transaction } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = extractToken(req)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectToDatabase()

    const body = await req.json()
    const { amount, reason, refundMethod = 'original' } = body

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Validation - use correct camelCase field names matching Mongoose schema
    if (booking.paymentStatus !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Booking has not been paid yet' },
        { status: 400 }
      )
    }

    const refundAmount = amount || booking.totalPrice

    if (refundAmount > booking.totalPrice) {
      return NextResponse.json(
        { success: false, error: 'Refund amount cannot exceed booking price' },
        { status: 400 }
      )
    }

    // Create refund transaction
    const refundTransaction = await Transaction.create({
      userId: booking.clientId,
      bookingId: booking._id,
      amount: refundAmount,
      type: 'refund',
      status: 'completed',
      paymentMethod: refundMethod === 'wallet' ? 'account_balance' : 'bank_transfer',
      reference: `Refund: ${booking._id}${reason ? ' - ' + reason : ''}`
    })

    // Update booking status
    booking.paymentStatus = 'refunded'
    booking.status = 'cancelled'
    booking.adminNotes = [booking.adminNotes, `Refund: $${refundAmount} - ${reason || 'No reason provided'}`].filter(Boolean).join('\n')
    await booking.save()

    // If refunding to wallet, atomically update user balance
    if (refundMethod === 'wallet') {
      await User.findByIdAndUpdate(booking.clientId, {
        $inc: { accountBalance: refundAmount }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        bookingId: booking._id,
        amount: refundAmount,
        method: refundMethod,
        transactionId: refundTransaction._id
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
    const token = extractToken(req)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization - use clientId not user_id
    if (decoded.role !== 'admin' && booking.clientId.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Look up refund transactions for this booking
    const refundTransactions = await Transaction.find({
      bookingId: booking._id,
      type: 'refund'
    }).lean()

    const totalRefunded = refundTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    return NextResponse.json({
      success: true,
      refund: {
        status: booking.paymentStatus === 'refunded' ? 'refunded' : totalRefunded > 0 ? 'partial' : 'none',
        amount: totalRefunded,
        totalPrice: booking.totalPrice,
        remainingAmount: booking.totalPrice - totalRefunded,
        transactions: refundTransactions.map(t => ({
          id: (t as any)._id.toString(),
          amount: t.amount,
          createdAt: t.createdAt
        }))
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
