import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List all pilots (admin only)
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
    const verifiedOnly = searchParams.get('verified_only') === 'true'

    const query: any = { role: 'pilot' }
    if (verifiedOnly) {
      query.kycVerified = true
    }

    const pilots = await User.find(query)
      .select('-passwordHash')
      .sort({ fullName: 1, email: 1 })
      .lean()

    const transformedPilots = pilots.map((p: any) => ({
      id: p._id.toString(),
      email: p.email,
      full_name: p.fullName,
      phone: p.phone,
      kyc_verified: p.kycVerified,
      created_at: p.createdAt
    }))

    return NextResponse.json({
      success: true,
      pilots: transformedPilots
    })
  } catch (error: any) {
    console.error('Get pilots error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
