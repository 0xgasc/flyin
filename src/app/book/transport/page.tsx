'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { MapPin, Calendar, Users, DollarSign, Navigation, Map, Grid } from 'lucide-react'
import { MobileNav } from '@/components/mobile-nav'
import { useTranslation } from '@/lib/i18n'
import { format } from 'date-fns'
// Helicopter selection moved to admin assignment workflow
import { getDistanceBetweenLocations, calculateTransportPrice, LOCATION_COORDINATES } from '@/lib/distance-calculator'
import dynamic from 'next/dynamic'

// Dynamically import SafeMapWrapper which checks WebGL before loading MapLibre
const SafeMapWrapper = dynamic(() => import('@/components/safe-map-wrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 sm:h-[500px] bg-luxury-black/50 flex items-center justify-center rounded">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-accent border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  )
})
import DestinationSelectorModal from '@/components/destination-selector-modal'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'

interface Airport {
  id: string
  code: string
  name: string
  city: string
}

export default function BookTransportPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { t } = useTranslation()
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fromCustom: '',
    toCustom: '',
    date: '',
    time: '',
    returnDate: '',
    returnTime: '',
    passengers: 1,
    notes: '',
    isRoundTrip: false,
  })
  const [priceBredown, setPriceBreakdown] = useState<any>(null)
  const [selectionMode, setSelectionMode] = useState<'dropdown' | 'map'>('dropdown')
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [showDestinationModal, setShowDestinationModal] = useState(false)
  const [modalType, setModalType] = useState<'from' | 'to'>('from')
  const [mapCollapsed, setMapCollapsed] = useState(false)

  useEffect(() => {
    fetchAirports()
  }, [])

  // Auto-collapse map when both locations are selected
  useEffect(() => {
    if (selectionMode === 'map' && formData.fromLocation && formData.toLocation) {
      setMapCollapsed(true)
    }
  }, [formData.fromLocation, formData.toLocation, selectionMode])

  const fetchAirports = async () => {
    try {
      const response = await fetch('/api/airports')
      const data = await response.json()

      if (data.success && data.airports) {
        setAirports(data.airports)
      } else {
        // Use demo airports if API fails
        setAirports([
          { id: '1', code: 'GUA', name: 'La Aurora International Airport', city: 'Guatemala City' },
          { id: '2', code: 'FRS', name: 'Mundo Maya International Airport', city: 'Flores' },
          { id: '3', code: 'PBR', name: 'Puerto Barrios Airport', city: 'Puerto Barrios' },
          { id: '4', code: 'RER', name: 'Retalhuleu Airport', city: 'Retalhuleu' },
        ])
      }
    } catch (err) {
      console.error('Error fetching airports:', err)
      // Use demo airports if API fails
      setAirports([
        { id: '1', code: 'GUA', name: 'La Aurora International Airport', city: 'Guatemala City' },
        { id: '2', code: 'FRS', name: 'Mundo Maya International Airport', city: 'Flores' },
        { id: '3', code: 'PBR', name: 'Puerto Barrios Airport', city: 'Puerto Barrios' },
        { id: '4', code: 'RER', name: 'Retalhuleu Airport', city: 'Retalhuleu' },
      ])
    }
  }

  // Helicopter selection moved to admin workflow

  const handleMapLocationSelect = (location: string, type: 'from' | 'to') => {
    setFormData(prev => ({
      ...prev,
      [type === 'from' ? 'fromLocation' : 'toLocation']: location
    }))
  }

  const handleDepartmentClick = (dept: Department) => {
    // If department has only one destination, select it directly
    if (dept.destinations.length === 1) {
      const destination = dept.destinations[0]
      if (!formData.fromLocation) {
        setFormData(prev => ({ ...prev, fromLocation: destination }))
      } else if (!formData.toLocation) {
        setFormData(prev => ({ ...prev, toLocation: destination }))
      } else {
        // Both filled, replace from location
        setFormData(prev => ({ ...prev, fromLocation: destination }))
      }
      return
    }

    // For departments with multiple destinations, show modal
    setSelectedDepartment(dept)
    setShowDestinationModal(true)
    // Determine modal type based on current selections
    if (!formData.fromLocation) {
      setModalType('from')
    } else if (!formData.toLocation) {
      setModalType('to')
    } else {
      // Both are filled, let user choose
      setModalType('from')
    }
  }

  const calculatePrice = useCallback(() => {
    const fromLoc = formData.fromLocation === 'custom' ? formData.fromCustom.toUpperCase() : formData.fromLocation
    const toLoc = formData.toLocation === 'custom' ? formData.toCustom.toUpperCase() : formData.toLocation
    
    if (!fromLoc || !toLoc) {
      setPriceBreakdown(null)
      return 0
    }

    try {
      const distance = getDistanceBetweenLocations(fromLoc, toLoc)
      // Use standard rate since helicopter selection is now handled by admin
      const standardRate = 600 // Standard hourly rate for pricing estimates
      const pricing = calculateTransportPrice(distance, standardRate, formData.passengers)
      
      // Apply round trip multiplier (same day round trip is 1.8x, different day is 2x)
      if (formData.isRoundTrip && formData.date && formData.returnDate) {
        const departureDate = new Date(formData.date)
        const returnDate = new Date(formData.returnDate)
        const isSameDay = departureDate.toDateString() === returnDate.toDateString()
        const multiplier = isSameDay ? 1.8 : 2.0
        
        const roundTripPricing = {
          ...pricing,
          basePrice: Math.round(pricing.basePrice * multiplier),
          totalPrice: Math.round(pricing.totalPrice * multiplier),
          isRoundTrip: true,
          multiplier
        }
        
        setPriceBreakdown(roundTripPricing)
        return roundTripPricing.totalPrice
      }
      
      setPriceBreakdown(pricing)
      return pricing.totalPrice
    } catch (error) {
      console.error('Price calculation error:', error)
      setPriceBreakdown(null)
      return 0
    }
  }, [formData.fromLocation, formData.toLocation, formData.fromCustom, formData.toCustom, formData.passengers, formData.isRoundTrip, formData.date, formData.returnDate])

  const [price, setPrice] = useState(0)

  useEffect(() => {
    // Calculate price when dependencies change
    const newPrice = calculatePrice()
    setPrice(newPrice)
  }, [calculatePrice])

  const getLocationName = (code: string, customValue?: string) => {
    if (code === 'custom' && customValue) {
      return customValue
    }
    const airport = airports.find(a => a.code === code)
    if (airport) return airport.name
    const knownLocation = LOCATION_COORDINATES[code]
    if (knownLocation) return knownLocation.name
    return code
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is logged in
    if (!profile?.id) {
      setError('Please log in to book a flight')
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?redirect=/book/transport')
      }, 2000)
      return
    }

    // Validate date is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(formData.date)
    if (selectedDate < today) {
      setError('Departure date cannot be in the past')
      return
    }

    // Validate return date if round trip
    if (formData.isRoundTrip && formData.returnDate) {
      const returnDate = new Date(formData.returnDate)
      if (returnDate < selectedDate) {
        setError('Return date must be on or after departure date')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const fromLoc = formData.fromLocation === 'custom' ? formData.fromCustom : formData.fromLocation
      const toLoc = formData.toLocation === 'custom' ? formData.toCustom : formData.toLocation

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_type: 'transport',
          from_location: fromLoc,
          to_location: toLoc,
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          return_date: formData.isRoundTrip ? formData.returnDate : null,
          return_time: formData.isRoundTrip ? formData.returnTime : null,
          is_round_trip: formData.isRoundTrip,
          passenger_count: formData.passengers,
          notes: formData.notes,
          total_price: price,
          price_breakdown: priceBredown ? {
            distance: priceBredown.distance,
            flightTime: priceBredown.flightTime,
            basePrice: priceBredown.basePrice,
            passengerFee: priceBredown.passengerFee || 0,
            multiplier: priceBredown.multiplier || null,
            isRoundTrip: priceBredown.isRoundTrip || false
          } : null
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create booking')
      }

      // Redirect to passenger details page with booking info
      const booking = data.booking
      const passengerDetailsUrl = `/book/passenger-details?booking_id=${booking.id}&passengers=${formData.passengers}&total_price=${price}&from=${encodeURIComponent(fromLoc)}&to=${encodeURIComponent(toLoc)}&date=${formData.date}&time=${formData.time}`

      setError('')
      router.push(passengerDetailsUrl)
    } catch (error: any) {
      setError(error.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      <MobileNav 
        title={t('services.transport.cta')}
        showBackButton={true}
        customActions={
          <div className="hidden md:flex items-center space-x-4">
            {profile ? (
              <div className="text-xs sm:text-sm text-gray-300">
                {t('common.welcome')}, {profile?.fullName || profile?.email}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-sm text-gray-300 hover:text-white">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="text-sm bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        }
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">{t('booking.title.transport')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="card-luxury space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                {t('booking.form.route_details')}
              </h2>
              
              {/* Selection Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded p-1">
                <button
                  type="button"
                  onClick={() => setSelectionMode('dropdown')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectionMode === 'dropdown'
                      ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-gold-400 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Grid className="h-4 w-4 inline mr-1" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('map')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectionMode === 'map'
                      ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-gold-400 shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Map className="h-4 w-4 inline mr-1" />
                  Map
                </button>
              </div>
            </div>

            {selectionMode === 'dropdown' ? (
              <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('booking.form.from')}
                </label>
                <select
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select departure</option>
                  <optgroup label="Airports">
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.code}>
                        {airport.name} ({airport.code})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Popular Destinations">
                    <option value="ANTIGUA">Antigua Guatemala</option>
                    <option value="ATITLAN">Lake Atitlán</option>
                    <option value="TIKAL">Tikal National Park</option>
                    <option value="SEMUC">Semuc Champey</option>
                    <option value="MONTERRICO">Monterrico Beach</option>
                    <option value="LIVINGSTON">Livingston</option>
                  </optgroup>
                  <option value="custom">{t('booking.form.custom_location')}</option>
                </select>
                {formData.fromLocation === 'custom' && (
                  <input
                    type="text"
                    value={formData.fromCustom}
                    onChange={(e) => setFormData({ ...formData, fromCustom: e.target.value })}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter departure location"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('booking.form.to')}
                </label>
                <select
                  value={formData.toLocation}
                  onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select destination</option>
                  <optgroup label="Airports">
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.code}>
                        {airport.name} ({airport.code})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Popular Destinations">
                    <option value="ANTIGUA">Antigua Guatemala</option>
                    <option value="ATITLAN">Lake Atitlán</option>
                    <option value="TIKAL">Tikal National Park</option>
                    <option value="SEMUC">Semuc Champey</option>
                    <option value="MONTERRICO">Monterrico Beach</option>
                    <option value="LIVINGSTON">Livingston</option>
                  </optgroup>
                  <option value="custom">{t('booking.form.custom_location')}</option>
                </select>
                {formData.toLocation === 'custom' && (
                  <input
                    type="text"
                    value={formData.toCustom}
                    onChange={(e) => setFormData({ ...formData, toCustom: e.target.value })}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter destination"
                    required
                  />
                )}
              </div>
            </div>
            ) : (
              /* Map Selection Mode */
              <div className="space-y-6">
                {mapCollapsed ? (
                  <div className="text-center py-4">
                    <button
                      type="button"
                      onClick={() => setMapCollapsed(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Map className="h-4 w-4" />
                      Show Map
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center text-gray-600 dark:text-gray-400 mb-6">
                      <p className="text-sm">
                        Click on markers to select your departure and destination
                      </p>
                    </div>

                    <div style={showDestinationModal ? { display: 'none' } : undefined}>
                      <SafeMapWrapper
                        onDepartmentClick={handleDepartmentClick}
                        selectedFrom={formData.fromLocation}
                        selectedTo={formData.toLocation}
                        mode="both"
                      />
                    </div>
                  </>
                )}

                {/* Selected Locations Display */}
                {(formData.fromLocation || formData.toLocation) && (
                  <div className="bg-luxury-black/30 border border-luxury-slate/30 rounded p-4 backdrop-blur-sm">
                    <h3 className="font-semibold text-gray-200 mb-2">Selected Route:</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">From:</span>
                        <p className="font-medium text-brand-accent">
                          {formData.fromLocation || 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">To:</span>
                        <p className="font-medium text-amber-400">
                          {formData.toLocation || 'Not selected'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>


          <div className="card-luxury space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600" />
              {t('booking.form.schedule')}
            </h2>

            {/* Trip Type Toggle */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('booking.form.trip_type')}</span>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    checked={!formData.isRoundTrip}
                    onChange={() => setFormData({ ...formData, isRoundTrip: false, returnDate: '', returnTime: '' })}
                    className="mr-2"
                  />
                  <span className="text-sm">{t('booking.form.one_way')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    checked={formData.isRoundTrip}
                    onChange={() => setFormData({ ...formData, isRoundTrip: true })}
                    className="mr-2"
                  />
                  <span className="text-sm">{t('booking.form.round_trip')}</span>
                </label>
              </div>
            </div>

            {/* Departure */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                {formData.isRoundTrip ? t('booking.form.departure') : t('booking.form.flight_details')}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('booking.form.departure_date')}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('booking.form.departure_time')}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Return - Only show if round trip */}
            {formData.isRoundTrip && (
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Return</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('booking.form.return_date')}
                    </label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      min={formData.date || format(new Date(), 'yyyy-MM-dd')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    
                    {/* Same Day Quick Options */}
                    {formData.date && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, returnDate: formData.date })}
                          className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          {t('booking.form.same_day')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextDay = new Date(formData.date)
                            nextDay.setDate(nextDay.getDate() + 1)
                            setFormData({ ...formData, returnDate: format(nextDay, 'yyyy-MM-dd') })
                          }}
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          {t('booking.form.next_day')}
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('booking.form.return_time')}
                    </label>
                    <input
                      type="time"
                      value={formData.returnTime}
                      onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                {/* Same Day Return Notice */}
                {formData.date && formData.returnDate && formData.date === formData.returnDate && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mt-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      💡 <strong>Same Day Return:</strong> 10% discount applied! Great for quick business trips or day tours.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card-luxury space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              {t('booking.form.passengers')}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('booking.form.num_passengers')}
              </label>
              <select
                value={formData.passengers}
                onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? t('booking.form.passenger') : t('booking.form.passengers')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('booking.form.notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                placeholder={t('booking.form.special_requirements')}
              />
            </div>
          </div>

          <div className="card-luxury bg-primary-50 dark:bg-gray-900 border-primary-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-primary-700 dark:text-gold-400 mr-2" />
                <span className="text-xl font-semibold text-primary-900 dark:text-white">
                  {t('booking.form.price_breakdown')}
                </span>
              </div>
              <span className="text-3xl font-bold text-primary-900 dark:text-white">
                ${price}
              </span>
            </div>
            
            {priceBredown && (
              <div className="space-y-2 text-sm text-primary-800 dark:text-gray-300 mb-4">
                <div className="flex justify-between">
                  <span>{t('pricing.distance')}:</span>
                  <span>{priceBredown.distance} km {priceBredown.isRoundTrip ? t('booking.form.each_way') : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pricing.flight_time')}:</span>
                  <span>{priceBredown.flightTime} minutes {priceBredown.isRoundTrip ? t('booking.form.each_way') : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>{priceBredown.isRoundTrip ? t('booking.form.one_way_price') : t('booking.form.estimated_price')}</span>
                  <span>${Math.round(priceBredown.basePrice / (priceBredown.multiplier || 1))}</span>
                </div>
                {priceBredown.isRoundTrip && (
                  <div className="flex justify-between">
                    <span>Round Trip Multiplier:</span>
                    <span>×{priceBredown.multiplier} {priceBredown.multiplier === 1.8 ? '(Same Day Discount)' : ''}</span>
                  </div>
                )}
                {priceBredown.passengerFee > 0 && (
                  <div className="flex justify-between">
                    <span>{t('pricing.additional_passengers')}:</span>
                    <span>+${priceBredown.passengerFee}</span>
                  </div>
                )}
                <div className="border-t border-primary-300 dark:border-gray-600 pt-2 flex justify-between font-semibold">
                  <span>{t('pricing.total')} {priceBredown.isRoundTrip ? t('booking.form.round_trip') : ''} {t('pricing.base_price')}:</span>
                  <span>${priceBredown.totalPrice}</span>
                </div>
              </div>
            )}

            <div className="flex items-center text-sm text-primary-700 dark:text-gray-400">
              <Navigation className="h-4 w-4 mr-2" />
              {formData.fromLocation && formData.toLocation ? (
                <span>
                  Route: {getLocationName(formData.fromLocation, formData.fromCustom)} → {getLocationName(formData.toLocation, formData.toCustom)}
                </span>
              ) : (
                <span>Select departure and destination to see pricing</span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:flex-1 px-6 py-4 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 btn-luxury disabled:opacity-50 py-4 sm:py-3 text-base font-medium"
            >
              {loading ? t('booking.form.booking') : t('booking.form.book_flight')}
            </button>
          </div>
        </form>
      </div>

      {/* Destination Selector Modal */}
      {showDestinationModal && selectedDepartment && (
        <DestinationSelectorModal
          department={selectedDepartment}
          isOpen={showDestinationModal}
          onClose={() => {
            setShowDestinationModal(false)
            setSelectedDepartment(null)
          }}
          onSelect={(destination) => {
            handleMapLocationSelect(destination, modalType)
          }}
          type={modalType}
        />
      )}
    </div>
  )
}