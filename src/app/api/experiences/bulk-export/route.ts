import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Experience, User } from '@/models'
import { verifyToken } from '@/lib/jwt'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
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
    const format = searchParams.get('format') || 'xlsx' // xlsx or csv

    const experiences = await Experience.find({}).lean()

    // Transform data for export
    const exportData = experiences.map((exp: any) => ({
      ID: exp._id.toString(),
      Name: exp.name,
      Description: exp.description,
      'Short Description': exp.short_description,
      Category: exp.category,
      Duration: exp.duration,
      'Base Price': exp.base_price,
      'Max Passengers': exp.max_passengers,
      Location: exp.location,
      'Is Active': exp.is_active ? 'Yes' : 'No',
      'Featured': exp.featured ? 'Yes' : 'No',
      'Image URLs': exp.images?.map((img: any) => img.url).join('; ') || '',
      'Highlights': exp.highlights?.join('; ') || '',
      'Included Items': exp.included?.join('; ') || '',
      'Not Included Items': exp.not_included?.join('; ') || '',
      Tags: exp.tags?.join('; ') || '',
      'Min Booking Hours': exp.min_booking_hours || '',
      'Cancellation Policy': exp.cancellation_policy || '',
      'Created At': exp.created_at ? new Date(exp.created_at).toISOString() : '',
      'Updated At': exp.updated_at ? new Date(exp.updated_at).toISOString() : ''
    }))

    if (format === 'csv') {
      // Generate CSV
      const ws = XLSX.utils.json_to_sheet(exportData)
      const csv = XLSX.utils.sheet_to_csv(ws)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="experiences-export-${Date.now()}.csv"`,
        },
      })
    } else {
      // Generate Excel
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Experiences')

      // Add instructions sheet
      const instructions = [
        { Instruction: 'How to use this file:' },
        { Instruction: '1. Edit data in the "Experiences" sheet' },
        { Instruction: '2. For array fields (like Highlights, Tags), separate values with semicolons (;)' },
        { Instruction: '3. For boolean fields (Is Active, Featured), use "Yes" or "No"' },
        { Instruction: '4. Leave ID blank for new experiences' },
        { Instruction: '5. Upload this file via the bulk import endpoint' },
        { Instruction: '' },
        { Instruction: 'Field Descriptions:' },
        { Instruction: 'ID - Unique identifier (auto-generated for new records)' },
        { Instruction: 'Name - Experience name (required)' },
        { Instruction: 'Description - Full description' },
        { Instruction: 'Short Description - Brief summary' },
        { Instruction: 'Category - Experience category (e.g., "scenic", "adventure")' },
        { Instruction: 'Duration - Duration in minutes' },
        { Instruction: 'Base Price - Price in USD' },
        { Instruction: 'Max Passengers - Maximum number of passengers' },
        { Instruction: 'Location - Location name' },
        { Instruction: 'Is Active - Yes/No' },
        { Instruction: 'Featured - Yes/No (show on homepage)' },
        { Instruction: 'Image URLs - Semicolon-separated list of image URLs' },
        { Instruction: 'Highlights - Semicolon-separated key features' },
        { Instruction: 'Included Items - Semicolon-separated included items' },
        { Instruction: 'Not Included Items - Semicolon-separated excluded items' },
        { Instruction: 'Tags - Semicolon-separated tags for filtering' },
      ]

      const instructionsWs = XLSX.utils.json_to_sheet(instructions)
      XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions')

      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="experiences-export-${Date.now()}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting experiences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export experiences' },
      { status: 500 }
    )
  }
}
