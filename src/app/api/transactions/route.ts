import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Transaction from '@/models/Transaction'
import { getAuthUser } from '@/lib/auth-middleware'

// GET /api/transactions - Get user's transactions
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const transactions = await Transaction.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean()

    // Transform to match frontend expectations
    const transformedTransactions = transactions.map((t: any) => ({
      id: t._id.toString(),
      createdAt: t.createdAt,
      userId: t.userId.toString(),
      type: t.type,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      reference: t.reference,
      status: t.status
    }))

    return NextResponse.json({ success: true, transactions: transformedTransactions })
  } catch (error: any) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/transactions - Create a new transaction (deposit request)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, amount, paymentMethod, reference } = body

    if (!type || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const transaction = await Transaction.create({
      userId: user.userId,
      type,
      amount,
      paymentMethod,
      reference: reference || null,
      status: 'pending'
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction._id.toString(),
        createdAt: transaction.createdAt,
        type: transaction.type,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status
      }
    })
  } catch (error: any) {
    console.error('Transaction create error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
