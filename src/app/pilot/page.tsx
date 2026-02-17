'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { MobileNav } from '@/components/mobile-nav'
import { Calendar, MapPin, Clock, Users, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { WhatsAppContactButton } from '@/components/whatsapp-contact-button'

interface Booking {
  id: string
  created_at: string
  booking_type: 'transport' | 'experience'
  status: string
  from_location: string | null
  to_location: string | null
  scheduled_date: string
  scheduled_time: string
  passenger_count: number
  total_price: number
  notes: string | null
  profiles: {
    full_name: string | null
    email: string
    phone: string | null
  }
  experiences: {
    name: string
    location: string
    duration_hours: number
  } | null
}

export default function PilotDashboard() {

  const { profile } = useAuthStore()
  const { t } = useTranslation()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      fetchBookings()
    }
  }, [profile, filter])

  const fetchBookings = async () => {
    try {
      // Build query params based on filter
      let statusQuery = ''
      if (filter === 'active') {
        statusQuery = '&status=assigned&status=accepted'
      } else if (filter === 'completed') {
        statusQuery = '&status=completed'
      }

      const response = await fetch(`/api/bookings?${statusQuery}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()

      if (data.success && data.bookings) {
        // Transform API response to match expected format
        const transformedBookings = data.bookings.map((b: any) => ({
          id: b.id,
          created_at: b.created_at,
          booking_type: b.booking_type,
          status: b.status,
          from_location: b.from_location,
          to_location: b.to_location,
          scheduled_date: b.scheduled_date,
          scheduled_time: b.scheduled_time,
          passenger_count: b.passenger_count,
          total_price: b.total_price,
          notes: b.notes,
          profiles: b.profiles || {
            full_name: b.client?.full_name,
            email: b.client?.email,
            phone: b.client?.phone
          },
          experiences: b.experiences || (b.experience ? {
            name: b.experience.name,
            location: b.experience.location || '',
            duration_hours: b.experience.duration_hours || 0
          } : null)
        }))
        setBookings(transformedBookings)
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const acceptMission = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'accepted' })
      })

      if (response.ok) {
        fetchBookings()
      } else {
        console.error('Error accepting mission')
        // Update local state for optimistic UI
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, status: 'accepted' } : b
        ))
      }
    } catch (err) {
      console.error('Error accepting mission:', err)
      // Update local state for optimistic UI
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'accepted' } : b
      ))
    }
  }

  const markAsCompleted = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'completed' })
      })

      if (response.ok) {
        fetchBookings()
      } else {
        console.error('Error completing mission')
        // Update local state for optimistic UI
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, status: 'completed' } : b
        ))
      }
    } catch (err) {
      console.error('Error completing mission:', err)
      // Update local state for optimistic UI
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'completed' } : b
      ))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      case 'accepted':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      <MobileNav />

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('pilot.my_assignments')}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded ${
                filter === 'active' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {t('pilot.active_missions')}
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded ${
                filter === 'completed' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {t('pilot.completed')}
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {t('pilot.all')}
            </button>
          </div>
        </div>

        {!profile?.kycVerified && (
          <div className="card-luxury bg-yellow-50 border-yellow-200 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-semibold text-yellow-900">{t('pilot.verification_required')}</h3>
                <p className="text-yellow-700">
                  {t('pilot.verification_desc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Flight Summary Card */}
        {!loading && (() => {
          const upcoming = bookings
            .filter(b => ['assigned', 'accepted'].includes(b.status) && b.scheduled_date >= new Date().toISOString().split('T')[0])
            .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.scheduled_time.localeCompare(b.scheduled_time))
          const next = upcoming[0]
          if (!next) return null
          const daysUntil = Math.ceil((new Date(next.scheduled_date).getTime() - new Date().setHours(0,0,0,0)) / 86400000)
          return (
            <div className="card-luxury border-2 border-luxury-gold/40 bg-gradient-to-r from-gray-900 to-gray-800 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-luxury-gold uppercase tracking-widest mb-1">Your Next Flight</p>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {next.booking_type === 'experience' && next.experiences
                      ? next.experiences.name
                      : next.from_location && next.to_location
                        ? `${next.from_location} → ${next.to_location}`
                        : 'Charter Flight'}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-300 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {next.scheduled_date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {next.scheduled_time}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {next.passenger_count} pax</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className={`text-3xl font-bold ${daysUntil === 0 ? 'text-red-400' : daysUntil === 1 ? 'text-yellow-400' : 'text-luxury-gold'}`}>
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{next.status}</p>
                </div>
              </div>
            </div>
          )
        })()}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card-luxury text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('pilot.no_assignments')}</h3>
            <p className="text-gray-500">{t('pilot.no_assignments_desc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isNew = booking.status === 'assigned' &&
                new Date(booking.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              return (
              <div key={booking.id} className={`card-luxury ${isNew ? 'ring-2 ring-blue-400' : ''}`}>
                {isNew && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      <AlertCircle className="h-3 w-3" /> Nueva Asignación
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(booking.status)}
                      <h3 className="text-xl font-semibold">
                        {booking.booking_type === 'transport' 
                          ? `Transport: ${booking.from_location} → ${booking.to_location}`
                          : `Experience: ${booking.experiences?.name}`
                        }
                      </h3>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {t('pilot.client')}: {booking.profiles.full_name} ({booking.profiles.email})
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary-900">
                    ${booking.total_price}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                      {format(new Date(booking.scheduled_date), 'MMMM dd, yyyy')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-primary-600" />
                      {booking.scheduled_time}
                      {booking.experiences && ` (${booking.experiences.duration_hours} hours)`}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-primary-600" />
                      {booking.passenger_count} passengers
                    </div>
                  </div>
                  <div className="space-y-2">
                    {booking.profiles.phone && (
                      <div className="text-sm text-gray-600">
                        {t('pilot.phone')}: {booking.profiles.phone}
                      </div>
                    )}
                    {booking.experiences && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                        {booking.experiences.location}
                      </div>
                    )}
                  </div>
                </div>

                {booking.notes && (
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{t('pilot.notes')}:</span> {booking.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  {booking.status === 'assigned' && (
                    <button
                      onClick={() => acceptMission(booking.id)}
                      className="btn-primary text-sm"
                    >
                      {t('pilot.accept_mission')}
                    </button>
                  )}
                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => markAsCompleted(booking.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
                    >
                      {t('pilot.mark_completed')}
                    </button>
                  )}
                  <WhatsAppContactButton
                    booking={{
                      id: booking.id,
                      type: booking.booking_type,
                      experienceName: booking.experiences?.name,
                      fromLocation: booking.from_location || undefined,
                      toLocation: booking.to_location || undefined,
                      scheduledDate: booking.scheduled_date,
                      scheduledTime: booking.scheduled_time,
                      passengerCount: booking.passenger_count,
                      totalPrice: booking.total_price,
                      status: booking.status
                    }}
                    variant="link"
                  />
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}