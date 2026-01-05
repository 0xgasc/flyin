import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const query: any = {}
    if (role) query.role = role

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ])

    const transformedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      email: u.email,
      full_name: u.fullName,
      phone: u.phone,
      role: u.role,
      account_balance: u.accountBalance,
      kyc_verified: u.kycVerified,
      created_at: u.createdAt,
      updated_at: u.updatedAt
    }))

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create user (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    const body = await request.json()
    const { email, password, full_name, phone, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const user = new User({
      email: email.toLowerCase().trim(),
      fullName: full_name || null,
      phone: phone || null,
      role: role || 'client'
    })

    await user.setPassword(password)
    await user.save()

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
        account_balance: user.accountBalance,
        kyc_verified: user.kycVerified
      }
    })
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
