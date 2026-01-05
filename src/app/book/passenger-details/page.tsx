'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { Users, Plus, Trash2, ShoppingCart, Plane, DollarSign } from 'lucide-react'

interface PassengerDetails {
  name: string
  age: number
  passport: string
  emergency_contact: string
  dietary_restrictions: string
  special_requests: string
}

interface Addon {
  id: string
  name: string
  description: string
  price: number
  category: string
  quantity: number
}

interface SelectedAddon {
  addon_id: string
  quantity: number
  unit_price: number
}

function PassengerDetailsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, user } = useAuthStore()

  // Get booking ID from URL params
  const bookingId = searchParams.get('booking_id')

  // State for actual booking data from database
  const [bookingData, setBookingData] = useState<{
    booking_id: string | null
    passenger_count: number
    base_price: number // Actual price from database - NOT from URL
    from_location: string
    to_location: string
    date: string
    time: string
  } | null>(null)

  const [passengers, setPassengers] = useState<PassengerDetails[]>([])
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([])
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([])
  const [loading, setLoading] = useState(true) // Start loading
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Fetch booking from database to get actual price (prevents price manipulation)
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Missing booking ID. Please restart the booking process.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          credentials: 'include'
        })
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error('Booking not found')
        }

        const booking = data.booking

        // Verify the booking belongs to the current user
        if (user && booking.client_id !== user.id) {
          throw new Error('You do not have permission to modify this booking')
        }

        setBookingData({
          booking_id: booking.id,
          passenger_count: booking.passenger_count || 1,
          base_price: booking.total_price, // Use price from database, NOT URL
          from_location: booking.from_location || '',
          to_location: booking.to_location || '',
          date: booking.scheduled_date || '',
          time: booking.scheduled_time || ''
        })

        // Initialize passenger forms
        const initialPassengers = Array.from({ length: booking.passenger_count || 1 }, (_, i) => ({
          name: i === 0 ? profile?.fullName || '' : '',
          age: 25,
          passport: '',
          emergency_contact: '',
          dietary_restrictions: '',
          special_requests: ''
        }))
        setPassengers(initialPassengers)
      } catch (err: any) {
        setError(err.message || 'Failed to load booking')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
    fetchAddons()
  }, [bookingId, user, profile])

  const fetchAddons = async () => {
    try {
      const response = await fetch('/api/addons')
      const data = await response.json()

      if (data.success && data.addons) {
        const addonsWithQuantity = data.addons.map((addon: any) => ({ ...addon, quantity: 0 }))
        setAvailableAddons(addonsWithQuantity)
      } else {
        // Use placeholder addons if API not ready
        setAvailableAddons([
          { id: 'priority-boarding', name: 'Priority Boarding', description: 'Skip the queue with priority boarding access', price: 25, category: 'service', quantity: 0 },
          { id: 'luxury-seating', name: 'Luxury Seating', description: 'Upgrade to premium leather seating', price: 50, category: 'comfort', quantity: 0 },
          { id: 'gourmet-meal', name: 'Gourmet Meal Service', description: 'Chef-prepared meal with local specialties', price: 35, category: 'catering', quantity: 0 },
          { id: 'photography-package', name: 'Aerial Photography', description: 'Professional photos of your journey', price: 75, category: 'service', quantity: 0 },
          { id: 'ground-transport', name: 'Ground Transportation', description: 'Luxury car service to/from helipad', price: 60, category: 'service', quantity: 0 },
        ])
      }
    } catch (err) {
      console.warn('Addons fetch error:', err)
      // Use placeholder addons if API fails
      setAvailableAddons([
        { id: 'priority-boarding', name: 'Priority Boarding', description: 'Skip the queue with priority boarding access', price: 25, category: 'service', quantity: 0 },
        { id: 'luxury-seating', name: 'Luxury Seating', description: 'Upgrade to premium leather seating', price: 50, category: 'comfort', quantity: 0 },
        { id: 'gourmet-meal', name: 'Gourmet Meal Service', description: 'Chef-prepared meal with local specialties', price: 35, category: 'catering', quantity: 0 },
        { id: 'photography-package', name: 'Aerial Photography', description: 'Professional photos of your journey', price: 75, category: 'service', quantity: 0 },
        { id: 'ground-transport', name: 'Ground Transportation', description: 'Luxury car service to/from helipad', price: 60, category: 'service', quantity: 0 },
      ])
    }
  }

  const updatePassenger = (index: number, field: keyof PassengerDetails, value: string | number) => {
    const updated = [...passengers]
    updated[index] = { ...updated[index], [field]: value }
    setPassengers(updated)
  }

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    const addon = availableAddons.find(a => a.id === addonId)
    if (!addon) return

    // Update available addons list
    setAvailableAddons(prev => 
      prev.map(a => a.id === addonId ? { ...a, quantity } : a)
    )

    // Update selected addons
    if (quantity > 0) {
      setSelectedAddons(prev => {
        const existing = prev.find(s => s.addon_id === addonId)
        if (existing) {
          return prev.map(s => s.addon_id === addonId ? { ...s, quantity } : s)
        } else {
          return [...prev, { addon_id: addonId, quantity, unit_price: addon.price }]
        }
      })
    } else {
      setSelectedAddons(prev => prev.filter(s => s.addon_id !== addonId))
    }
  }

  const calculateAddonTotal = () => {
    return selectedAddons.reduce((total, addon) => total + (addon.quantity * addon.unit_price), 0)
  }

  const calculateGrandTotal = () => {
    // Use base price from database (not URL params) to prevent manipulation
    return (bookingData?.base_price || 0) + calculateAddonTotal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bookingData?.booking_id) {
      setError('Missing booking information. Please restart the booking process.')
      return
    }

    // Validate passenger names
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        setError(`Please enter name for passenger ${i + 1}`)
        return
      }
      if (passengers[i].age < 1 || passengers[i].age > 120) {
        setError(`Please enter a valid age for passenger ${i + 1}`)
        return
      }
    }

    setSubmitting(true)
    setError('')

    try {
      // Recalculate total from database base price + addons
      // This prevents any price manipulation from URL parameters
      const addonTotal = calculateAddonTotal()
      const grandTotal = bookingData.base_price + addonTotal

      // Update booking with passenger details and addons
      const response = await fetch(`/api/bookings/${bookingData.booking_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          passenger_details: passengers,
          selected_addons: selectedAddons,
          addon_total_price: addonTotal,
          total_price: grandTotal // Calculated from database base_price, not URL
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save passenger details')
      }

      // Redirect to payment confirmation
      alert('Passenger details saved! Proceeding to payment...')
      router.push(`/dashboard?highlight=${bookingData.booking_id}`)

    } catch (error: any) {
      setError(error.message || 'Failed to save passenger details')
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'service': return '🎯'
      case 'comfort': return '🛋️'
      case 'catering': return '🍽️'
      case 'equipment': return '🎒'
      default: return '✨'
    }
  }

  const groupedAddons = availableAddons.reduce((groups, addon) => {
    const category = addon.category
    if (!groups[category]) groups[category] = []
    groups[category].push(addon)
    return groups
  }, {} as Record<string, Addon[]>)

  // Show loading state while fetching booking
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  // Show error if booking couldn't be loaded
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-800 font-medium mb-2">Unable to load booking</p>
          <p className="text-red-700 text-sm mb-4">{error || 'Booking not found'}</p>
          <Link href="/book/transport" className="btn-primary inline-block">
            Start New Booking
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Plane className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate</span>
          </Link>
          <div className="text-sm">
            Step 2 of 2: Passenger Details & Add-ons
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Passenger Details</h1>
          <p className="text-gray-600">
            Flight: {bookingData.from_location} → {bookingData.to_location} on {bookingData.date} at {bookingData.time}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Passenger Details */}
          <div className="card-luxury">
            <h2 className="text-xl font-semibold flex items-center mb-6">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              Passenger Information
            </h2>

            <div className="space-y-6">
              {passengers.map((passenger, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Passenger {index + 1} {index === 0 && '(Primary)'}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                        required
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        value={passenger.age}
                        onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                        required
                        min="1"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport/ID Number
                      </label>
                      <input
                        type="text"
                        value={passenger.passport}
                        onChange={(e) => updatePassenger(index, 'passport', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                        placeholder="Passport or ID number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={passenger.emergency_contact}
                        onChange={(e) => updatePassenger(index, 'emergency_contact', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                        placeholder="Name and phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dietary Restrictions
                      </label>
                      <input
                        type="text"
                        value={passenger.dietary_restrictions}
                        onChange={(e) => updatePassenger(index, 'dietary_restrictions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                        placeholder="Allergies, vegetarian, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests
                      </label>
                      <input
                        type="text"
                        value={passenger.special_requests}
                        onChange={(e) => updatePassenger(index, 'special_requests', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                        placeholder="Mobility assistance, etc."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="card-luxury">
            <h2 className="text-xl font-semibold flex items-center mb-6">
              <ShoppingCart className="h-5 w-5 mr-2 text-primary-600" />
              Enhance Your Experience
            </h2>

            <div className="space-y-6">
              {Object.entries(groupedAddons).map(([category, addons]) => (
                <div key={category}>
                  <h3 className="font-medium text-gray-900 mb-3 capitalize">
                    {getCategoryIcon(category)} {category} Add-ons
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {addons.map((addon) => (
                      <div key={addon.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{addon.name}</h4>
                            <span className="text-lg font-bold text-primary-600">${addon.price}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{addon.description}</p>
                          
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Quantity:</label>
                            <button
                              type="button"
                              onClick={() => updateAddonQuantity(addon.id, Math.max(0, addon.quantity - 1))}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{addon.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateAddonQuantity(addon.id, addon.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="card-luxury bg-primary-50 border-primary-200">
            <h2 className="text-xl font-semibold flex items-center mb-4">
              <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
              Price Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Flight Price:</span>
                <span>${bookingData.base_price.toFixed(2)}</span>
              </div>
              
              {selectedAddons.length > 0 && (
                <>
                  <div className="border-t border-primary-200 pt-2 mt-2">
                    <div className="font-medium text-primary-800 mb-1">Add-ons:</div>
                    {selectedAddons.map((addon) => {
                      const addonInfo = availableAddons.find(a => a.id === addon.addon_id)
                      return (
                        <div key={addon.addon_id} className="flex justify-between text-xs ml-4">
                          <span>{addonInfo?.name} × {addon.quantity}:</span>
                          <span>${(addon.quantity * addon.unit_price).toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Add-ons Subtotal:</span>
                    <span>${calculateAddonTotal().toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <div className="border-t border-primary-300 pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary-800">${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-luxury disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Continue to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PassengerDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <PassengerDetailsContent />
    </Suspense>
  )
}