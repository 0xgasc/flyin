import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Transaction from '@/models/Transaction'
import { getAuthUser } from '@/lib/auth-middleware'

// GET /api/transactions - Get user's transactions (or all for admin)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const isAdmin = user.role === 'admin'
    const query = isAdmin ? {} : { userId: user.userId }

    const transactions = await Transaction.find(query)
      .populate('userId', 'fullName email')
      .populate('processedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean()

    const transformedTransactions = transactions.map((t: any) => {
      const u = t.userId && typeof t.userId === 'object' ? t.userId : null
      const processor = t.processedBy && typeof t.processedBy === 'object' ? t.processedBy : null

      return {
        id: t._id.toString(),
        createdAt: t.createdAt,
        userId: u ? u._id.toString() : t.userId?.toString(),
        type: t.type,
        amount: t.amount,
        paymentMethod: t.paymentMethod,
        reference: t.reference,
        status: t.status,
        adminNotes: t.adminNotes,
        processedAt: t.processedAt,
        user: u ? {
          full_name: u.fullName,
          email: u.email
        } : null,
        processedBy: processor ? {
          full_name: processor.fullName,
          email: processor.email
        } : null
      }
    })

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
