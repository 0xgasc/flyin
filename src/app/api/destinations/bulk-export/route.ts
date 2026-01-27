import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Destination, User } from '@/models'
import { verifyToken } from '@/lib/jwt'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'xlsx'

    const destinations = await Destination.find({}).lean()

    // Transform data for export
    const exportData = destinations.map((dest: any) => ({
      ID: dest._id.toString(),
      Name: dest.name,
      Description: dest.description,
      'Short Description': dest.short_description,
      Region: dest.region,
      'Flight Time From GUA (minutes)': dest.flight_time_from_gua,
      'Base Price From GUA': dest.base_price_from_gua,
      Latitude: dest.coordinates?.lat || '',
      Longitude: dest.coordinates?.lng || '',
      'Is Active': dest.is_active ? 'Yes' : 'No',
      'Featured': dest.featured ? 'Yes' : 'No',
      'Image URLs': dest.images?.map((img: any) => img.url).join('; ') || '',
      'Highlights': dest.highlights?.join('; ') || '',
      'Best Season': dest.best_season || '',
      Attractions: dest.attractions?.join('; ') || '',
      'Weather Info': dest.weather_info || '',
      'Accommodation Options': dest.accommodation_options?.join('; ') || '',
      Tags: dest.tags?.join('; ') || '',
      'Created At': dest.created_at ? new Date(dest.created_at).toISOString() : '',
      'Updated At': dest.updated_at ? new Date(dest.updated_at).toISOString() : ''
    }))

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const csv = XLSX.utils.sheet_to_csv(ws)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="destinations-export-${Date.now()}.csv"`,
        },
      })
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Destinations')

      // Add instructions sheet
      const instructions = [
        { Instruction: 'How to use this file:' },
        { Instruction: '1. Edit data in the "Destinations" sheet' },
        { Instruction: '2. For array fields (like Highlights, Tags), separate values with semicolons (;)' },
        { Instruction: '3. For boolean fields (Is Active, Featured), use "Yes" or "No"' },
        { Instruction: '4. Leave ID blank for new destinations' },
        { Instruction: '5. Upload this file via the bulk import endpoint' },
        { Instruction: '' },
        { Instruction: 'Field Descriptions:' },
        { Instruction: 'ID - Unique identifier (auto-generated for new records)' },
        { Instruction: 'Name - Destination name (required)' },
        { Instruction: 'Description - Full description' },
        { Instruction: 'Short Description - Brief summary' },
        { Instruction: 'Region - Geographic region' },
        { Instruction: 'Flight Time From GUA - Duration in minutes from Guatemala City' },
        { Instruction: 'Base Price From GUA - Price in USD from Guatemala City' },
        { Instruction: 'Latitude - GPS latitude coordinate' },
        { Instruction: 'Longitude - GPS longitude coordinate' },
        { Instruction: 'Is Active - Yes/No' },
        { Instruction: 'Featured - Yes/No (show on homepage)' },
        { Instruction: 'Image URLs - Semicolon-separated list of image URLs' },
        { Instruction: 'Highlights - Semicolon-separated key features' },
        { Instruction: 'Best Season - Best time to visit' },
        { Instruction: 'Attractions - Semicolon-separated attractions' },
        { Instruction: 'Weather Info - Weather description' },
        { Instruction: 'Accommodation Options - Semicolon-separated hotel options' },
        { Instruction: 'Tags - Semicolon-separated tags for filtering' },
      ]

      const instructionsWs = XLSX.utils.json_to_sheet(instructions)
      XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions')

      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="destinations-export-${Date.now()}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting destinations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export destinations' },
      { status: 500 }
    )
  }
}
