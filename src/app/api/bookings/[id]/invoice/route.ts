import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Booking, User } from '@/models'
import { verifyToken } from '@/lib/jwt'
import { jsPDF } from 'jspdf'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    await connectToDatabase()

    const booking: any = await Booking.findById(id).populate('user_id')
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization - user can view their own invoice, admin can view any
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const customer = booking.user_id
    if (user.role !== 'admin' && customer._id.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to view this invoice' },
        { status: 403 }
      )
    }

    // Generate PDF
    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FlyInGuate', 20, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Premium Helicopter Services', 20, 27)
    doc.text('Guatemala City, Guatemala', 20, 32)

    // Invoice title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 150, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Invoice #: ${booking._id}`, 150, 27)
    doc.text(`Date: ${new Date(booking.created_at).toLocaleDateString()}`, 150, 32)
    doc.text(`Status: ${booking.payment_status.toUpperCase()}`, 150, 37)

    // Divider line
    doc.setLineWidth(0.5)
    doc.line(20, 45, 190, 45)

    // Bill to
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', 20, 55)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(customer.fullName || 'N/A', 20, 62)
    doc.text(customer.email, 20, 67)
    if (customer.phone) {
      doc.text(customer.phone, 20, 72)
    }

    // Flight details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Flight Details:', 20, 85)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    let yPos = 92
    doc.text(`Type: ${booking.booking_type}`, 20, yPos)
    yPos += 5
    doc.text(`From: ${booking.departure_location}`, 20, yPos)
    yPos += 5
    doc.text(`To: ${booking.arrival_location || 'Same as departure'}`, 20, yPos)
    yPos += 5
    doc.text(`Date: ${new Date(booking.departure_date).toLocaleDateString()}`, 20, yPos)
    yPos += 5
    doc.text(`Time: ${booking.departure_time || 'TBD'}`, 20, yPos)
    yPos += 5
    doc.text(`Passengers: ${booking.num_passengers}`, 20, yPos)
    yPos += 5

    if (booking.special_requests) {
      doc.text(`Special Requests: ${booking.special_requests}`, 20, yPos)
      yPos += 5
    }

    // Pricing table
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Pricing Breakdown:', 20, yPos)

    yPos += 10
    doc.setLineWidth(0.3)
    doc.line(20, yPos, 190, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.text('Description', 25, yPos)
    doc.text('Amount', 165, yPos, { align: 'right' })

    yPos += 5
    doc.setLineWidth(0.1)
    doc.line(20, yPos, 190, yPos)

    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.text(`Base Flight Price (${booking.num_passengers} passengers)`, 25, yPos)
    doc.text(`$${booking.base_price.toFixed(2)}`, 165, yPos, { align: 'right' })

    // Add-ons
    if (booking.addons && booking.addons.length > 0) {
      yPos += 5
      doc.text('Add-ons:', 25, yPos)
      booking.addons.forEach((addon: any) => {
        yPos += 5
        doc.text(`  - ${addon.name}`, 25, yPos)
        doc.text(`$${addon.price.toFixed(2)}`, 165, yPos, { align: 'right' })
      })
    }

    yPos += 5
    doc.setLineWidth(0.3)
    doc.line(20, yPos, 190, yPos)

    // Total
    yPos += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOTAL:', 25, yPos)
    doc.text(`$${booking.final_price.toFixed(2)} USD`, 165, yPos, { align: 'right' })

    // Payment info
    if (booking.payment_status === 'paid') {
      yPos += 15
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Payment Method: ${booking.payment_method || 'N/A'}`, 20, yPos)
      if (booking.payment_date) {
        yPos += 5
        doc.text(`Payment Date: ${new Date(booking.payment_date).toLocaleDateString()}`, 20, yPos)
      }
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('Thank you for choosing FlyInGuate!', 105, pageHeight - 20, { align: 'center' })
    doc.text('For questions, contact us at info@flyinguate.com', 105, pageHeight - 15, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${booking._id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
