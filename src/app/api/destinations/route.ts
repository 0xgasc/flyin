import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Destination, DestinationImage, Airport } from '@/models'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List all active destinations (public) or all (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'
    const includeImages = searchParams.get('include_images') === 'true'
    const includeAirport = searchParams.get('include_airport') === 'true'

    // Check if admin for inactive destinations
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

    let destinationsQuery = Destination.find(query)
      .sort({ orderIndex: 1, name: 1 })

    // Populate airport data if requested
    if (includeAirport) {
      destinationsQuery = destinationsQuery.populate('airportId', 'code name city')
    }

    const destinations = await destinationsQuery.lean()

    // Fetch images if requested
    let imagesByDestination: { [key: string]: any[] } = {}
    if (includeImages) {
      const destIds = destinations.map((d: any) => d._id)
      const images = await DestinationImage.find({ destinationId: { $in: destIds } })
        .sort({ orderIndex: 1 })
        .lean()

      images.forEach((img: any) => {
        const destId = img.destinationId.toString()
        if (!imagesByDestination[destId]) {
          imagesByDestination[destId] = []
        }
        imagesByDestination[destId].push({
          id: img._id.toString(),
          image_url: img.imageUrl,
          caption: img.caption,
          is_primary: img.isPrimary,
          order_index: img.orderIndex
        })
      })
    }

    const transformedDestinations = destinations.map((d: any) => {
      // Extract airport data if populated
      const airport = d.airportId && typeof d.airportId === 'object' ? {
        id: d.airportId._id?.toString(),
        code: d.airportId.code,
        name: d.airportId.name,
        city: d.airportId.city
      } : null

      return {
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
        is_hub: d.isHub || false,
        airport: includeAirport ? airport : undefined,
        airport_id: d.airportId && typeof d.airportId === 'string' ? d.airportId : d.airportId?._id?.toString() || null,
        metadata: d.metadata,
        order_index: d.orderIndex,
        is_active: d.isActive,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
        destination_images: includeImages ? (imagesByDestination[d._id.toString()] || []) : undefined
      }
    })

    // Cache public requests for 5 minutes (admin requests bypass cache)
    const headers: HeadersInit = {}
    if (!isAdmin) {
      headers['Cache-Control'] = 'public, s-maxage=300, stale-while-revalidate=60'
    }

    return NextResponse.json({
      success: true,
      destinations: transformedDestinations
    }, { headers })
  } catch (error: any) {
    console.error('Get destinations error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create destination (admin only)
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
    const {
      name,
      description,
      location,
      coordinates,
      features,
      highlights,
      requirements,
      meeting_point,
      best_time,
      difficulty_level,
      airport_id,
      is_hub,
      metadata,
      order_index
    } = body

    if (!name || !description || !location || !coordinates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const destination = new Destination({
      name: name.trim(),
      description,
      location: location.trim(),
      coordinates,
      features: features || [],
      highlights: highlights || [],
      requirements: requirements || [],
      meetingPoint: meeting_point || null,
      bestTime: best_time || null,
      difficultyLevel: difficulty_level || null,
      airportId: airport_id || null,
      isHub: is_hub || false,
      metadata: metadata || null,
      orderIndex: order_index ?? null,
      isActive: true
    })

    await destination.save()

    return NextResponse.json({
      success: true,
      destination: {
        id: destination._id.toString(),
        name: destination.name,
        description: destination.description,
        location: destination.location,
        coordinates: destination.coordinates,
        features: destination.features,
        highlights: destination.highlights,
        requirements: destination.requirements,
        meeting_point: destination.meetingPoint,
        best_time: destination.bestTime,
        difficulty_level: destination.difficultyLevel,
        metadata: destination.metadata,
        order_index: destination.orderIndex,
        is_active: destination.isActive
      }
    })
  } catch (error: any) {
    console.error('Create destination error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
