import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Experience, User } from '@/models'
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

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse Excel/CSV
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
        // Skip if row is marked for deletion
        if (row.Action === 'DELETE' || row.Action === 'delete') {
          if (row.ID) {
            await Experience.findByIdAndDelete(row.ID)
            results.deleted++
          }
          continue
        }

        // Parse array fields (semicolon-separated)
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

        // Parse images
        const images = parseArray(row['Image URLs']).map((url: string) => ({ url }))

        const experienceData = {
          name: row.Name,
          description: row.Description,
          short_description: row['Short Description'],
          category: row.Category,
          duration: Number(row.Duration) || 0,
          base_price: Number(row['Base Price']) || 0,
          max_passengers: Number(row['Max Passengers']) || 1,
          location: row.Location,
          is_active: parseBoolean(row['Is Active']),
          featured: parseBoolean(row.Featured),
          images,
          highlights: parseArray(row.Highlights),
          included: parseArray(row['Included Items']),
          not_included: parseArray(row['Not Included Items']),
          tags: parseArray(row.Tags),
          min_booking_hours: Number(row['Min Booking Hours']) || undefined,
          cancellation_policy: row['Cancellation Policy'] || undefined,
          updatedAt: new Date()
        }

        // Validate required fields
        if (!experienceData.name) {
          results.errors.push(`Row missing required field: Name`)
          continue
        }

        // Update existing or create new
        if (row.ID && row.ID !== '') {
          await Experience.findByIdAndUpdate(row.ID, experienceData, {
            runValidators: true
          })
          results.updated++
        } else {
          await Experience.create(experienceData)
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
    console.error('Error importing experiences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import experiences' },
      { status: 500 }
    )
  }
}
