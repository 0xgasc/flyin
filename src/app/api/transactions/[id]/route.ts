import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Transaction, User } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const transaction = await Transaction.findById(id)
      .populate('userId', 'fullName email')
      .lean()

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const t = transaction as any

    // Only allow access to own transactions unless admin
    if (payload.role !== 'admin' && t.userId._id.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: t._id.toString(),
        user_id: t.userId._id.toString(),
        user: {
          full_name: t.userId.fullName,
          email: t.userId.email
        },
        type: t.type,
        amount: t.amount,
        payment_method: t.paymentMethod,
        reference: t.reference,
        status: t.status,
        admin_notes: t.adminNotes,
        processed_at: t.processedAt,
        created_at: t.createdAt
      }
    })
  } catch (error: any) {
    console.error('Get transaction error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update transaction status (admin only)
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
    await connectDB()

    const body = await request.json()
    const { status, admin_notes } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Get current transaction
    const transaction = await Transaction.findById(id)
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const updates: any = {
      status,
      processedAt: new Date(),
      processedBy: payload.userId
    }
    if (admin_notes !== undefined) {
      updates.adminNotes = admin_notes
    }

    // Update transaction
    await Transaction.findByIdAndUpdate(id, { $set: updates })

    // If approving a deposit, update user balance
    if (status === 'approved' && transaction.type === 'deposit') {
      const user = await User.findById(transaction.userId)
      if (user) {
        const currentBalance = user.accountBalance || 0
        const newBalance = currentBalance + transaction.amount

        await User.findByIdAndUpdate(transaction.userId, {
          $set: { accountBalance: newBalance }
        })

        return NextResponse.json({
          success: true,
          message: 'Transaction approved and balance updated',
          balance_updated: true,
          new_balance: newBalance
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${status} successfully`
    })
  } catch (error: any) {
    console.error('Update transaction error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
