'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { supabase } from '@/lib/supabase'
import { Plane, Calendar, MapPin, Clock, Users, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
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
      let query = supabase
        .from('bookings')
        .select(`
          *,
          profiles:client_id (
            full_name,
            email,
            phone
          ),
          experiences (
            name,
            location,
            duration_hours
          )
        `)
        .eq('pilot_id', profile?.id)
        .order('scheduled_date', { ascending: true })

      if (filter === 'active') {
        query = query.in('status', ['assigned', 'accepted'])
      } else if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (data) setBookings(data)
      if (error) {
        console.error('Error fetching bookings:', error)
        // Demo data for pilot view
        setBookings([
          {
            id: '1',
            created_at: new Date().toISOString(),
            booking_type: 'transport',
            status: 'assigned',
            from_location: 'GUA',
            to_location: 'FRS',
            scheduled_date: '2024-01-15',
            scheduled_time: '10:00',
            passenger_count: 2,
            total_price: 350,
            notes: 'Business travelers, punctuality important',
            profiles: {
              full_name: 'John Smith',
              email: 'john@example.com',
              phone: '+502 5555 1234'
            },
            experiences: null
          },
          {
            id: '2',
            created_at: new Date().toISOString(),
            booking_type: 'experience',
            status: 'assigned',
            from_location: null,
            to_location: null,
            scheduled_date: '2024-01-16',
            scheduled_time: '14:00',
            passenger_count: 4,
            total_price: 650,
            notes: 'Anniversary celebration',
            profiles: {
              full_name: 'Maria Garcia',
              email: 'maria@example.com',
              phone: '+502 5555 5678'
            },
            experiences: {
              name: 'Lake Atitlán Discovery',
              location: 'Lake Atitlán',
              duration_hours: 2
            }
          }
        ])
      }
    } catch (err) {
      // Demo data for pilot view
      setBookings([
        {
          id: '1',
          created_at: new Date().toISOString(),
          booking_type: 'transport',
          status: 'assigned',
          from_location: 'GUA',
          to_location: 'FRS',
          scheduled_date: '2024-01-15',
          scheduled_time: '10:00',
          passenger_count: 2,
          total_price: 350,
          notes: 'Business travelers, punctuality important',
          profiles: {
            full_name: 'John Smith',
            email: 'john@example.com',
            phone: '+502 5555 1234'
          },
          experiences: null
        },
        {
          id: '2',
          created_at: new Date().toISOString(),
          booking_type: 'experience',
          status: 'assigned',
          from_location: null,
          to_location: null,
          scheduled_date: '2024-01-16',
          scheduled_time: '14:00',
          passenger_count: 4,
          total_price: 650,
          notes: 'Anniversary celebration',
          profiles: {
            full_name: 'Maria Garcia',
            email: 'maria@example.com',
            phone: '+502 5555 5678'
          },
          experiences: {
            name: 'Lake Atitlán Discovery',
            location: 'Lake Atitlán',
            duration_hours: 2
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const acceptMission = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'accepted' })
        .eq('id', bookingId)

      if (!error) {
        fetchBookings()
      }
    } catch (err) {
      console.error('Error accepting mission:', err)
      // Update local state for demo
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'accepted' } : b
      ))
    }
  }

  const markAsCompleted = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)

      if (!error) {
        fetchBookings()
      }
    } catch (err) {
      console.error('Error completing mission:', err)
      // Update local state for demo
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
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Plane className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate - Pilot Portal</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              {profile?.kyc_verified ? (
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
              {profile?.full_name || profile?.email}
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
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
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'active' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Active Missions
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'completed' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {!profile?.kyc_verified && (
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
            <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
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
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
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