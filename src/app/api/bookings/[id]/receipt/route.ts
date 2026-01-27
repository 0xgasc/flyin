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

    // Check if booking is paid
    if (booking.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Receipt can only be generated for paid bookings' },
        { status: 400 }
      )
    }

    // Check authorization
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
        { success: false, error: 'Unauthorized to view this receipt' },
        { status: 403 }
      )
    }

    // Generate PDF Receipt
    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FlyInGuate', 20, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Premium Helicopter Services', 20, 27)
    doc.text('Guatemala City, Guatemala', 20, 32)

    // Receipt title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('RECEIPT', 150, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Receipt #: ${booking._id}`, 150, 27)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 32)
    doc.text(`PAID`, 150, 37)

    // Payment confirmation badge
    doc.setFillColor(34, 197, 94) // Green
    doc.roundedRect(148, 42, 42, 8, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT RECEIVED', 169, 47, { align: 'center' })
    doc.setTextColor(0, 0, 0)

    // Divider line
    doc.setLineWidth(0.5)
    doc.line(20, 55, 190, 55)

    // Bill to
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Billed To:', 20, 65)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(customer.fullName || 'N/A', 20, 72)
    doc.text(customer.email, 20, 77)
    if (customer.phone) {
      doc.text(customer.phone, 20, 82)
    }

    // Payment information box
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(20, 90, 170, 28, 2, 2, 'F')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Payment Information', 25, 97)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Payment Date: ${booking.payment_date ? new Date(booking.payment_date).toLocaleDateString() : 'N/A'}`, 25, 104)
    doc.text(`Payment Method: ${booking.payment_method || 'N/A'}`, 25, 109)
    if (booking.transaction_id) {
      doc.text(`Transaction ID: ${booking.transaction_id}`, 25, 114)
    }

    // Flight details
    let yPos = 130
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Flight Details:', 20, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
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
    doc.text('Payment Summary:', 20, yPos)

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

    // Total paid
    yPos += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setFillColor(34, 197, 94, 20) // Light green background
    doc.roundedRect(18, yPos - 5, 174, 12, 2, 2, 'F')
    doc.text('TOTAL PAID:', 25, yPos + 2)
    doc.text(`$${booking.final_price.toFixed(2)} USD`, 165, yPos + 2, { align: 'right' })

    // Thank you message
    yPos += 20
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(20, yPos, 170, 20, 2, 2, 'F')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Thank You!', 105, yPos + 8, { align: 'center' })

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('We appreciate your business and look forward to serving you again.', 105, yPos + 14, { align: 'center' })

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text('This is an official receipt from FlyInGuate', 105, pageHeight - 20, { align: 'center' })
    doc.text('For questions, contact us at info@flyinguate.com', 105, pageHeight - 15, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${booking._id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating receipt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate receipt' },
      { status: 500 }
    )
  }
}
