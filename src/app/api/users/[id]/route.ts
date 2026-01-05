import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET - Get single user (admin only, or self)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only admin or the user themselves can access
    if (payload.role !== 'admin' && payload.userId !== id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await User.findById(id).select('-passwordHash').lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const u: any = user
    return NextResponse.json({
      success: true,
      user: {
        id: u._id.toString(),
        email: u.email,
        full_name: u.fullName,
        phone: u.phone,
        role: u.role,
        account_balance: u.accountBalance,
        kyc_verified: u.kycVerified,
        created_at: u.createdAt,
        updated_at: u.updatedAt
      }
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update user (admin only, or self for limited fields)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const isAdmin = payload.role === 'admin'
    const isSelf = payload.userId === id

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const body = await request.json()
    const updateData: any = {}

    // Fields everyone can update on their own profile
    if (body.full_name !== undefined) updateData.fullName = body.full_name
    if (body.phone !== undefined) updateData.phone = body.phone

    // Admin-only fields
    if (isAdmin) {
      if (body.role !== undefined) updateData.role = body.role
      if (body.kyc_verified !== undefined) updateData.kycVerified = body.kyc_verified
      if (body.account_balance !== undefined) updateData.accountBalance = body.account_balance
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash').lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const u: any = user
    return NextResponse.json({
      success: true,
      user: {
        id: u._id.toString(),
        email: u.email,
        full_name: u.fullName,
        phone: u.phone,
        role: u.role,
        account_balance: u.accountBalance,
        kyc_verified: u.kycVerified
      }
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
