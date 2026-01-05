import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Transaction from '@/models/Transaction'
import { extractToken, verifyToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET - Get user's account balance
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

    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get recent transactions
    const transactions = await Transaction.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    const transformedTransactions = transactions.map((t: any) => ({
      id: t._id.toString(),
      type: t.type,
      amount: t.amount,
      payment_method: t.paymentMethod,
      status: t.status,
      reference: t.reference,
      created_at: t.createdAt
    }))

    return NextResponse.json({
      success: true,
      balance: user.accountBalance,
      transactions: transformedTransactions
    })
  } catch (error: any) {
    console.error('Get balance error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Add funds to account (deposit)
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
    const { amount, payment_method, reference } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!payment_method || !['card', 'bank'].includes(payment_method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Create transaction record
      const transaction = new Transaction({
        userId: new mongoose.Types.ObjectId(payload.userId),
        type: 'deposit',
        amount,
        paymentMethod: payment_method,
        status: 'completed', // In real app, this would be pending until payment confirmed
        reference: reference || null
      })
      await transaction.save({ session })

      // Update user balance
      const user = await User.findByIdAndUpdate(
        payload.userId,
        { $inc: { accountBalance: amount } },
        { new: true, session }
      )

      await session.commitTransaction()

      return NextResponse.json({
        success: true,
        new_balance: user!.accountBalance,
        transaction: {
          id: transaction._id.toString(),
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status
        }
      })
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  } catch (error: any) {
    console.error('Add funds error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
