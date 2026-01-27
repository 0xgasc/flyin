import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Destination, User } from '@/models'
import { verifyToken } from '@/lib/jwt'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await User.findById(decoded.userId)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectToDatabase()

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)

    const results = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [] as string[]
    }

    for (const row of data as any[]) {
      try {
        // Handle deletions
        if (row.Action === 'DELETE' || row.Action === 'delete') {
          if (row.ID) {
            await Destination.findByIdAndDelete(row.ID)
            results.deleted++
          }
          continue
        }

        // Parse array fields
        const parseArray = (value: any) => {
          if (!value) return []
          if (Array.isArray(value)) return value
          return String(value).split(';').map(item => item.trim()).filter(Boolean)
        }

        // Parse boolean fields
        const parseBoolean = (value: any) => {
          if (typeof value === 'boolean') return value
          if (!value) return false
          const str = String(value).toLowerCase()
          return str === 'yes' || str === 'true' || str === '1'
        }

        // Parse coordinates
        const coordinates = (row.Latitude && row.Longitude) ? {
          lat: Number(row.Latitude),
          lng: Number(row.Longitude)
        } : undefined

        // Parse images
        const images = parseArray(row['Image URLs']).map((url: string) => ({ url }))

        const destinationData = {
          name: row.Name,
          description: row.Description,
          short_description: row['Short Description'],
          region: row.Region,
          flight_time_from_gua: Number(row['Flight Time From GUA (minutes)']) || 0,
          base_price_from_gua: Number(row['Base Price From GUA']) || 0,
          coordinates,
          is_active: parseBoolean(row['Is Active']),
          featured: parseBoolean(row.Featured),
          images,
          highlights: parseArray(row.Highlights),
          best_season: row['Best Season'] || undefined,
          attractions: parseArray(row.Attractions),
          weather_info: row['Weather Info'] || undefined,
          accommodation_options: parseArray(row['Accommodation Options']),
          tags: parseArray(row.Tags),
          updatedAt: new Date()
        }

        // Validate required fields
        if (!destinationData.name) {
          results.errors.push(`Row missing required field: Name`)
          continue
        }

        // Update existing or create new
        if (row.ID && row.ID !== '') {
          await Destination.findByIdAndUpdate(row.ID, destinationData, {
            runValidators: true
          })
          results.updated++
        } else {
          await Destination.create(destinationData)
          results.created++
        }
      } catch (error: any) {
        results.errors.push(`Error processing row (${row.Name || 'unnamed'}): ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk import completed',
      results
    })
  } catch (error) {
    console.error('Error importing destinations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import destinations' },
      { status: 500 }
    )
  }
}
