import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Experience from '@/models/Experience'
import { extractToken, verifyToken } from '@/lib/jwt'

// GET - List all active experiences (public) or all (admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'

    // Check if admin for inactive experiences
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

    const experiences = await Experience.find(query)
      .sort({ name: 1 })
      .lean()

    const transformedExperiences = experiences.map((e: any) => ({
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
    }))

    // Cache public requests for 5 minutes (admin requests bypass cache)
    const headers: HeadersInit = {}
    if (!isAdmin) {
      headers['Cache-Control'] = 'public, s-maxage=300, stale-while-revalidate=60'
    }

    return NextResponse.json({
      success: true,
      experiences: transformedExperiences
    }, { headers })
  } catch (error: any) {
    console.error('Get experiences error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create experience (admin only)
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
      duration_hours,
      base_price,
      max_passengers,
      includes,
      location,
      image_url
    } = body

    if (!name || !description || !duration_hours || !base_price || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const experience = new Experience({
      name: name.trim(),
      description,
      durationHours: duration_hours,
      basePrice: base_price,
      maxPassengers: max_passengers || 4,
      includes: includes || [],
      location: location.trim(),
      imageUrl: image_url || null,
      isActive: true
    })

    await experience.save()

    return NextResponse.json({
      success: true,
      experience: {
        id: experience._id.toString(),
        name: experience.name,
        description: experience.description,
        duration_hours: experience.durationHours,
        base_price: experience.basePrice,
        max_passengers: experience.maxPassengers,
        includes: experience.includes,
        location: experience.location,
        image_url: experience.imageUrl,
        is_active: experience.isActive
      }
    })
  } catch (error: any) {
    console.error('Create experience error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
