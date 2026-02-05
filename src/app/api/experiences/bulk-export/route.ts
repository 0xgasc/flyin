import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Experience, ExperienceImage, User } from '@/models'
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

    // Fetch experiences with their images
    const experiences = await Experience.find({}).lean()

    // Fetch all experience images
    const experienceIds = experiences.map((exp: any) => exp._id)
    const allImages = await ExperienceImage.find({
      experienceId: { $in: experienceIds }
    }).lean()

    // Group images by experience ID
    const imagesByExperience: Record<string, any[]> = {}
    allImages.forEach((img: any) => {
      const expId = img.experienceId.toString()
      if (!imagesByExperience[expId]) {
        imagesByExperience[expId] = []
      }
      imagesByExperience[expId].push(img)
    })

    // Transform data for export - using correct field names
    const exportData = experiences.map((exp: any) => {
      const expImages = imagesByExperience[exp._id.toString()] || []

      // Format pricing tiers as readable string
      const pricingTiersStr = exp.pricingTiers?.map((tier: any) =>
        `${tier.minPassengers}-${tier.maxPassengers}pax:$${tier.price}`
      ).join('; ') || ''

      return {
        'ID': exp._id.toString(),
        'Name (EN)': exp.name || '',
        'Name (ES)': exp.nameEs || '',
        'Description (EN)': exp.description || '',
        'Description (ES)': exp.descriptionEs || '',
        'Location': exp.location || '',
        'Category': exp.category || '',
        'Category Name (EN)': exp.categoryNameEn || '',
        'Category Name (ES)': exp.categoryNameEs || '',
        'Duration (Hours)': exp.durationHours || 0,
        'Duration (Minutes)': exp.durationMinutes || '',
        'Base Price (USD)': exp.basePrice || 0,
        'Min Passengers': exp.minPassengers || 1,
        'Max Passengers': exp.maxPassengers || 4,
        'Pricing Tiers': pricingTiersStr,
        'Includes (EN)': exp.includes?.join('; ') || '',
        'Includes (ES)': exp.includesEs?.join('; ') || '',
        'Highlights': exp.highlights?.join('; ') || '',
        'Requirements': exp.requirements?.join('; ') || '',
        'Route Waypoints': exp.routeWaypoints?.join('; ') || '',
        'Meeting Point': exp.meetingPoint || '',
        'Order Index': exp.orderIndex ?? '',
        'Is Active': exp.isActive ? 'Yes' : 'No',
        'Main Image URL': exp.imageUrl || '',
        'Gallery Images': expImages.map((img: any) => img.imageUrl).join('; '),
        'Created At': exp.createdAt ? new Date(exp.createdAt).toISOString() : '',
        'Updated At': exp.updatedAt ? new Date(exp.updatedAt).toISOString() : ''
      }
    })

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const csv = XLSX.utils.sheet_to_csv(ws)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="experiences-export-${Date.now()}.csv"`,
        },
      })
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Experiences')

      // Add instructions sheet
      const instructions = [
        { Instruction: 'How to use this file:' },
        { Instruction: '1. Edit data in the "Experiences" sheet' },
        { Instruction: '2. For array fields (Includes, Highlights, etc.), separate values with semicolons (;)' },
        { Instruction: '3. For boolean fields (Is Active), use "Yes" or "No"' },
        { Instruction: '4. Leave ID blank for new experiences' },
        { Instruction: '5. Upload this file via the bulk import endpoint' },
        { Instruction: '' },
        { Instruction: 'Field Descriptions:' },
        { Instruction: 'ID - Unique identifier (auto-generated for new records)' },
        { Instruction: 'Name (EN) - Experience name in English (required)' },
        { Instruction: 'Name (ES) - Experience name in Spanish' },
        { Instruction: 'Description (EN) - Full description in English' },
        { Instruction: 'Description (ES) - Full description in Spanish' },
        { Instruction: 'Location - Location name (e.g., "Guatemala City")' },
        { Instruction: 'Category - Internal category code (e.g., "helitour")' },
        { Instruction: 'Category Name (EN/ES) - Display category name' },
        { Instruction: 'Duration (Hours) - Duration in hours' },
        { Instruction: 'Duration (Minutes) - Duration in minutes (alternative to hours)' },
        { Instruction: 'Base Price (USD) - Base price in US dollars' },
        { Instruction: 'Min/Max Passengers - Passenger limits' },
        { Instruction: 'Pricing Tiers - Format: "1-2pax:$450; 3-4pax:$550"' },
        { Instruction: 'Includes (EN/ES) - Semicolon-separated included items' },
        { Instruction: 'Highlights - Semicolon-separated key features' },
        { Instruction: 'Requirements - Semicolon-separated requirements' },
        { Instruction: 'Route Waypoints - Semicolon-separated route points' },
        { Instruction: 'Meeting Point - Where to meet for the experience' },
        { Instruction: 'Order Index - Display order (lower = first)' },
        { Instruction: 'Is Active - Yes/No' },
        { Instruction: 'Main Image URL - Primary image URL' },
        { Instruction: 'Gallery Images - Semicolon-separated gallery image URLs' },
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
