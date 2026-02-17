import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Addon } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

function requireAdmin(request: NextRequest) {
  const token = extractToken(request)
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

// PATCH - Update addon (toggle active, update fields)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()
    const body = await request.json()
    const { name, description, price, category, is_active } = body

    const updates: any = {}
    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = price
    if (category !== undefined) updates.category = category.trim()
    if (is_active !== undefined) updates.isActive = is_active

    const addon = await Addon.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true }
    ).lean() as any

    if (!addon) {
      return NextResponse.json({ error: 'Addon not found' }, { status: 404 })
    }

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete addon
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()
    const addon = await Addon.findByIdAndDelete(params.id)

    if (!addon) {
      return NextResponse.json({ error: 'Addon not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
