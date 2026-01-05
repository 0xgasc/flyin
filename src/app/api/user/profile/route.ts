import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth-middleware'

// PUT /api/user/profile - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fullName, phone } = body

    await connectToDatabase()

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      {
        fullName: fullName || null,
        phone: phone || null
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        accountBalance: user.accountBalance,
        kycVerified: user.kycVerified
      }
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
