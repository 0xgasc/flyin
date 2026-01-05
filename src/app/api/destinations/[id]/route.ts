import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Destination, DestinationImage } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET - Get single destination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid destination ID' }, { status: 400 })
    }

    const destination = await Destination.findById(id).lean()
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    // Fetch images
    const images = await DestinationImage.find({ destinationId: id })
      .sort({ orderIndex: 1 })
      .lean()

    const d: any = destination
    return NextResponse.json({
      success: true,
      destination: {
        id: d._id.toString(),
        name: d.name,
        description: d.description,
        location: d.location,
        coordinates: d.coordinates,
        features: d.features,
        highlights: d.highlights,
        requirements: d.requirements,
        meeting_point: d.meetingPoint,
        best_time: d.bestTime,
        difficulty_level: d.difficultyLevel,
        metadata: d.metadata,
        order_index: d.orderIndex,
        is_active: d.isActive,
        created_at: d.createdAt,
        updated_at: d.updatedAt
      },
      destination_images: images.map((img: any) => ({
        id: img._id.toString(),
        image_url: img.imageUrl,
        caption: img.caption,
        is_primary: img.isPrimary,
        order_index: img.orderIndex
      }))
    })
  } catch (error: any) {
    console.error('Get destination error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update destination (admin only)
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
      return NextResponse.json({ error: 'Invalid destination ID' }, { status: 400 })
    }

    const body = await request.json()
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description
    if (body.location !== undefined) updateData.location = body.location.trim()
    if (body.coordinates !== undefined) updateData.coordinates = body.coordinates
    if (body.features !== undefined) updateData.features = body.features
    if (body.highlights !== undefined) updateData.highlights = body.highlights
    if (body.requirements !== undefined) updateData.requirements = body.requirements
    if (body.meeting_point !== undefined) updateData.meetingPoint = body.meeting_point
    if (body.best_time !== undefined) updateData.bestTime = body.best_time
    if (body.difficulty_level !== undefined) updateData.difficultyLevel = body.difficulty_level
    if (body.metadata !== undefined) updateData.metadata = body.metadata
    if (body.order_index !== undefined) updateData.orderIndex = body.order_index
    if (body.is_active !== undefined) updateData.isActive = body.is_active

    const destination = await Destination.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean()

    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    const d: any = destination
    return NextResponse.json({
      success: true,
      destination: {
        id: d._id.toString(),
        name: d.name,
        description: d.description,
        location: d.location,
        coordinates: d.coordinates,
        features: d.features,
        is_active: d.isActive
      }
    })
  } catch (error: any) {
    console.error('Update destination error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete destination (admin only)
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
      return NextResponse.json({ error: 'Invalid destination ID' }, { status: 400 })
    }

    // Delete destination and associated images
    await Promise.all([
      Destination.findByIdAndDelete(id),
      DestinationImage.deleteMany({ destinationId: id })
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete destination error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
