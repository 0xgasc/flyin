'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, Clock, Users, MapPin, DollarSign, Plane, ArrowRight } from 'lucide-react'
import { MobileNav } from '@/components/mobile-nav'
import { WhatsAppContactButton } from '@/components/whatsapp-contact-button'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/lib/auth-store'
import { getAuthHeaders } from '@/lib/auth-client'
import { format } from 'date-fns'
import { es as esLocale, enUS as enLocale } from 'date-fns/locale'

interface BookingData {
  id: string
  booking_type: 'transport' | 'experience'
  status: string
  from_location: string | null
  to_location: string | null
  experience_id: string | null
  scheduled_date: string
  scheduled_time: string
  passenger_count: number
  total_price: number
  created_at: string
  experience?: {
    name: string
    description?: string
  }
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { locale } = useTranslation()
  const { profile } = useAuthStore()

  const bookingId = searchParams.get('booking_id')

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [experienceName, setExperienceName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      // First try to get from session storage (set by modal)
      const storedBooking = sessionStorage.getItem('lastBooking')
      if (storedBooking) {
        try {
          const parsed = JSON.parse(storedBooking)
          setExperienceName(parsed.experienceName || '')
        } catch {}
      }

      if (!bookingId) {
        // Try from session storage
        const storedId = sessionStorage.getItem('lastBookingId')
        if (storedId) {
          router.replace(`/book/confirmation?booking_id=${storedId}`)
          return
        }
        setError(locale === 'es' ? 'ID de reserva no encontrado' : 'Booking ID not found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          headers: getAuthHeaders(),
          credentials: 'include'
        })
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Booking not found')
        }

        setBooking(data.booking)

        // If experience booking, fetch experience name if not already set
        if (data.booking.experience_id && !experienceName && data.booking.experience?.name) {
          setExperienceName(data.booking.experience.name)
        }
      } catch (err: any) {
        setError(err.message || (locale === 'es' ? 'Error al cargar la reserva' : 'Failed to load booking'))
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, router, locale])

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return format(date, 'PPP', { locale: locale === 'es' ? esLocale : enLocale })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
        <MobileNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{locale === 'es' ? 'Cargando...' : 'Loading...'}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
        <MobileNav />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-700 dark:text-red-400 font-medium mb-4">{error || (locale === 'es' ? 'Reserva no encontrada' : 'Booking not found')}</p>
            <Link href="/book/experiences" className="btn-primary inline-block">
              {locale === 'es' ? 'Ver Experiencias' : 'View Experiences'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const bookingRef = booking.id.slice(-6).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      <MobileNav />

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {locale === 'es' ? '¡Reserva Confirmada!' : 'Booking Confirmed!'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {locale === 'es' ? 'Tu reserva ha sido creada exitosamente' : 'Your booking has been successfully created'}
          </p>
        </div>

        {/* Booking Card */}
        <div className="bg-white dark:bg-luxury-charcoal rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Booking Reference */}
          <div className="bg-primary-600 text-white p-4 text-center">
            <p className="text-sm opacity-90 mb-1">{locale === 'es' ? 'Número de Reserva' : 'Booking Reference'}</p>
            <p className="text-2xl font-bold tracking-wider">#{bookingRef}</p>
          </div>

          {/* Booking Details */}
          <div className="p-6 space-y-4">
            {/* Experience/Flight Name */}
            <div className="flex items-start gap-3">
              <Plane className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{locale === 'es' ? 'Experiencia' : 'Experience'}</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {experienceName || booking.experience?.name || (booking.from_location && booking.to_location
                    ? `${booking.from_location} → ${booking.to_location}`
                    : (locale === 'es' ? 'Vuelo Reservado' : 'Flight Booked')
                  )}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{locale === 'es' ? 'Fecha' : 'Date'}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(booking.scheduled_date)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{locale === 'es' ? 'Hora' : 'Time'}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.scheduled_time}</p>
              </div>
            </div>

            {/* Passengers */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{locale === 'es' ? 'Pasajeros' : 'Passengers'}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.passenger_count}</p>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <DollarSign className="h-5 w-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{locale === 'es' ? 'Total' : 'Total'}</p>
                <p className="text-2xl font-bold text-primary-600">${booking.total_price.toLocaleString()} USD</p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="px-6 pb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">{locale === 'es' ? 'Estado:' : 'Status:'}</span>{' '}
                {locale === 'es' ? 'Pendiente de confirmación' : 'Pending confirmation'}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {locale === 'es'
                  ? 'Recibirás un correo cuando tu reserva sea confirmada.'
                  : "You'll receive an email when your booking is confirmed."
                }
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Contact */}
        <div className="mb-6">
          <WhatsAppContactButton
            booking={{
              id: booking.id,
              type: booking.booking_type,
              experienceName: experienceName || booking.experience?.name,
              fromLocation: booking.from_location || undefined,
              toLocation: booking.to_location || undefined,
              scheduledDate: booking.scheduled_date,
              scheduledTime: booking.scheduled_time,
              passengerCount: booking.passenger_count,
              totalPrice: booking.total_price,
              status: booking.status
            }}
          />
        </div>

        {/* Next Steps */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            {locale === 'es' ? 'Próximos Pasos' : 'Next Steps'}
          </h2>
          <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="font-medium text-primary-600">1.</span>
              {locale === 'es'
                ? 'Nuestro equipo revisará tu reserva y te contactará dentro de 24 horas.'
                : 'Our team will review your booking and contact you within 24 hours.'
              }
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-primary-600">2.</span>
              {locale === 'es'
                ? 'Recibirás instrucciones de pago por correo electrónico.'
                : "You'll receive payment instructions via email."
              }
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-primary-600">3.</span>
              {locale === 'es'
                ? 'Una vez confirmado el pago, recibirás los detalles completos del vuelo.'
                : "Once payment is confirmed, you'll receive complete flight details."
              }
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 btn-primary text-center"
          >
            {locale === 'es' ? 'Ver en Mi Panel' : 'View in Dashboard'}
          </Link>
          <Link
            href="/book/experiences"
            className="flex-1 btn-ghost text-center"
          >
            {locale === 'es' ? 'Explorar Más Experiencias' : 'Explore More Experiences'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
