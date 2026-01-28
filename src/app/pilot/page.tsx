'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { logout } from '@/lib/auth-client'
import { Calendar, MapPin, Clock, Users, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

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
  const router = useRouter()
  const { profile } = useAuthStore()
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold">FlyInGuate - Pilot Portal</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              {profile?.kycVerified ? (
                <span className="flex items-center text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verified Pilot
                </span>
              ) : (
                <span className="flex items-center text-yellow-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Pending Verification
                </span>
              )}
            </div>
            <div className="text-sm">
              {profile?.fullName || profile?.email}
            </div>
            <button
              onClick={async () => {
                await logout()
                router.push('/')
              }}
              className="text-sm hover:text-luxury-gold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Assignments</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded ${
                filter === 'active' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Active Missions
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded ${
                filter === 'completed' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {!profile?.kycVerified && (
          <div className="card-luxury bg-yellow-50 border-yellow-200 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-semibold text-yellow-900">Verification Required</h3>
                <p className="text-yellow-700">
                  Please complete in-person KYC verification to start receiving flight assignments.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card-luxury text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No assignments</h3>
            <p className="text-gray-500">You'll see flight assignments here once they're assigned to you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card-luxury">
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
                      Client: {booking.profiles.full_name} ({booking.profiles.email})
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
                        Phone: {booking.profiles.phone}
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
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </p>
                  </div>
                )}

                {booking.status === 'assigned' && (
                  <button
                    onClick={() => acceptMission(booking.id)}
                    className="btn-primary text-sm"
                  >
                    Accept Mission
                  </button>
                )}
                {booking.status === 'accepted' && (
                  <button
                    onClick={() => markAsCompleted(booking.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}