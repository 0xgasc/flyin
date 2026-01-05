import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Experience, ExperienceImage } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET - Get single experience
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid experience ID' }, { status: 400 })
    }

    const experience = await Experience.findById(id).lean()
    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    // Fetch images
    const images = await ExperienceImage.find({ experienceId: id })
      .sort({ orderIndex: 1 })
      .lean()

    const e: any = experience
    return NextResponse.json({
      success: true,
      experience: {
        id: e._id.toString(),
        name: e.name,
        name_es: e.nameEs,
        description: e.description,
        description_es: e.descriptionEs,
        duration_hours: e.durationHours,
        duration_minutes: e.durationMinutes,
        base_price: e.basePrice,
        max_passengers: e.maxPassengers,
        min_passengers: e.minPassengers,
        includes: e.includes,
        includes_es: e.includesEs,
        highlights: e.highlights,
        requirements: e.requirements,
        meeting_point: e.meetingPoint,
        location: e.location,
        aircraft_options: e.aircraftOptions,
        route_waypoints: e.routeWaypoints,
        category: e.category,
        category_name_en: e.categoryNameEn,
        category_name_es: e.categoryNameEs,
        image_url: e.imageUrl,
        order_index: e.orderIndex,
        is_active: e.isActive,
        created_at: e.createdAt,
        updated_at: e.updatedAt
      },
      experience_images: images.map((img: any) => ({
        id: img._id.toString(),
        image_url: img.imageUrl,
        caption: img.caption,
        is_primary: img.isPrimary,
        order_index: img.orderIndex
      }))
    })
  } catch (error: any) {
    console.error('Get experience error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update experience (admin only)
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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid experience ID' }, { status: 400 })
    }

    const body = await request.json()
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.name_es !== undefined) updateData.nameEs = body.name_es
    if (body.description !== undefined) updateData.description = body.description
    if (body.description_es !== undefined) updateData.descriptionEs = body.description_es
    if (body.duration_hours !== undefined) updateData.durationHours = body.duration_hours
    if (body.duration_minutes !== undefined) updateData.durationMinutes = body.duration_minutes
    if (body.base_price !== undefined) updateData.basePrice = body.base_price
    if (body.max_passengers !== undefined) updateData.maxPassengers = body.max_passengers
    if (body.min_passengers !== undefined) updateData.minPassengers = body.min_passengers
    if (body.includes !== undefined) updateData.includes = body.includes
    if (body.includes_es !== undefined) updateData.includesEs = body.includes_es
    if (body.highlights !== undefined) updateData.highlights = body.highlights
    if (body.requirements !== undefined) updateData.requirements = body.requirements
    if (body.meeting_point !== undefined) updateData.meetingPoint = body.meeting_point
    if (body.location !== undefined) updateData.location = body.location.trim()
    if (body.aircraft_options !== undefined) updateData.aircraftOptions = body.aircraft_options
    if (body.route_waypoints !== undefined) updateData.routeWaypoints = body.route_waypoints
    if (body.category !== undefined) updateData.category = body.category
    if (body.category_name_en !== undefined) updateData.categoryNameEn = body.category_name_en
    if (body.category_name_es !== undefined) updateData.categoryNameEs = body.category_name_es
    if (body.image_url !== undefined) updateData.imageUrl = body.image_url
    if (body.order_index !== undefined) updateData.orderIndex = body.order_index
    if (body.is_active !== undefined) updateData.isActive = body.is_active

    const experience = await Experience.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean()

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    const e: any = experience
    return NextResponse.json({
      success: true,
      experience: {
        id: e._id.toString(),
        name: e.name,
        description: e.description,
        duration_hours: e.durationHours,
        base_price: e.basePrice,
        location: e.location,
        is_active: e.isActive
      }
    })
  } catch (error: any) {
    console.error('Update experience error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete experience (admin only)
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
      return NextResponse.json({ error: 'Invalid experience ID' }, { status: 400 })
    }

    // Delete experience and associated images
    await Promise.all([
      Experience.findByIdAndDelete(id),
      ExperienceImage.deleteMany({ experienceId: id })
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete experience error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
