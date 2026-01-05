import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Addon } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List all active addons (public) or all (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'

    // Check if admin for inactive addons
    let isAdmin = false
    const token = extractToken(request)
    if (token) {
      const payload = verifyToken(token)
      if (payload?.role === 'admin') {
        isAdmin = true
      }
    }

    const query: any = {}
    if (!isAdmin || !includeInactive) {
      query.isActive = true
    }

    const addons = await Addon.find(query)
      .sort({ category: 1, name: 1 })
      .lean()

    const transformedAddons = addons.map((a: any) => ({
      id: a._id.toString(),
      name: a.name,
      description: a.description,
      price: a.price,
      category: a.category,
      is_active: a.isActive,
      created_at: a.createdAt
    }))

    return NextResponse.json({
      success: true,
      addons: transformedAddons
    })
  } catch (error: any) {
    console.error('Get addons error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create addon (admin only)
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
    const { name, description, price, category } = body

    if (!name || !description || price === undefined || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const addon = new Addon({
      name: name.trim(),
      description,
      price,
      category: category.trim(),
      isActive: true
    })

    await addon.save()

    return NextResponse.json({
      success: true,
      addon: {
        id: addon._id.toString(),
        name: addon.name,
        description: addon.description,
        price: addon.price,
        category: addon.category,
        is_active: addon.isActive
      }
    })
  } catch (error: any) {
    console.error('Create addon error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
