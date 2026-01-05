import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { DestinationImage, Destination } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List destination images
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const destinationId = searchParams.get('destination_id')

    const query: any = {}
    if (destinationId) {
      query.destinationId = destinationId
    }

    const limit = searchParams.get('limit')
    let imagesQuery = DestinationImage.find(query).sort({ orderIndex: 1 })
    if (limit) {
      imagesQuery = imagesQuery.limit(parseInt(limit))
    }
    const images = await imagesQuery.lean()

    const transformedImages = images.map((img: any) => ({
      id: img._id.toString(),
      destination_id: img.destinationId.toString(),
      image_url: img.imageUrl,
      caption: img.caption,
      is_primary: img.isPrimary,
      order_index: img.orderIndex,
      created_at: img.createdAt
    }))

    return NextResponse.json({
      success: true,
      images: transformedImages
    })
  } catch (error: any) {
    console.error('Get destination images error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Add image to destination (admin only)
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
    const { destination_id, image_url, caption, is_primary, order_index } = body

    if (!destination_id || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify destination exists
    const destination = await Destination.findById(destination_id)
    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    // If this is set as primary, unset any existing primary
    if (is_primary) {
      await DestinationImage.updateMany(
        { destinationId: destination_id },
        { $set: { isPrimary: false } }
      )
    }

    const image = new DestinationImage({
      destinationId: destination_id,
      imageUrl: image_url,
      caption: caption || null,
      isPrimary: is_primary || false,
      orderIndex: order_index || 0
    })

    await image.save()

    return NextResponse.json({
      success: true,
      image: {
        id: image._id.toString(),
        image_url: image.imageUrl,
        is_primary: image.isPrimary
      }
    })
  } catch (error: any) {
    console.error('Create destination image error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete image (admin only)
export async function DELETE(request: NextRequest) {
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
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    }

    const result = await DestinationImage.findByIdAndDelete(imageId)
    if (!result) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete destination image error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
