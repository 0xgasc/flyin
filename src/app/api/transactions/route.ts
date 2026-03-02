import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Transaction from '@/models/Transaction'
import { getAuthUser } from '@/lib/auth-middleware'
import { logger } from '@/lib/logger'
import { getErrorMessage } from '@/types/api.types'

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

    const transformedTransactions = transactions.map((t) => {
      const isUserPopulated = t.userId && typeof t.userId === 'object' && 'email' in t.userId
      const isProcessorPopulated = t.processedBy && typeof t.processedBy === 'object' && 'email' in t.processedBy

      return {
        id: t._id.toString(),
        createdAt: t.createdAt,
        userId: isUserPopulated ? (t.userId as any)._id.toString() : t.userId?.toString(),
        type: t.type,
        amount: t.amount,
        paymentMethod: t.paymentMethod,
        reference: t.reference,
        status: t.status,
        adminNotes: t.adminNotes,
        processedAt: t.processedAt,
        user: isUserPopulated ? {
          full_name: (t.userId as any).fullName,
          email: (t.userId as any).email
        } : null,
        processedBy: isProcessorPopulated ? {
          full_name: (t.processedBy as any).fullName,
          email: (t.processedBy as any).email
        } : null
      }
    })

    return NextResponse.json({ success: true, transactions: transformedTransactions })
  } catch (error) {
    logger.error('Transactions fetch error', error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
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
    const { type, amount, paymentMethod, reference, payment_proof_url } = body

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
      paymentProofUrl: payment_proof_url || null,
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
  } catch (error) {
    logger.error('Transaction create error', error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
