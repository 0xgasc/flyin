'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { login as authLogin, register as authRegister } from '@/lib/auth-client'
import { MapPin, Calendar, Users, DollarSign, Navigation, Map, Grid, Smartphone, ShieldCheck, Mail, Lock } from 'lucide-react'
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

// Map department IDs from homepage map to transport booking location codes
const DEPARTMENT_TO_LOCATION: Record<string, string> = {
  'guatemala': 'GUA',
  'sacatepequez': 'ANTIGUA',
  'solola': 'ATITLAN',
  'peten': 'FRS',
  'izabal': 'LIVINGSTON',
  'escuintla': 'MONTERRICO',
  'retalhuleu': 'RER',
  'alta-verapaz': 'SEMUC',
  'quetzaltenango': 'XELA',
  'huehuetenango': 'HUEHUE',
  'zacapa': 'ZAC',
  'quiche': 'AAZ',
}

// Map destination/airport names from map modal to location codes for price calculator
const DESTINATION_TO_CODE: Record<string, string> = {
  // Airport names → codes
  'La Aurora International Airport': 'GUA',
  'Mundo Maya International Airport': 'FRS',
  'Puerto Barrios Airport': 'PBR',
  'Retalhuleu Airport': 'RER',
  'Cobán Airport': 'COBAN',
  'Huehuetenango Airport': 'HUEHUE',
  'Zacapa Airport': 'ZAC',
  'Quiché Airport': 'AAZ',
  // Helipads → main destination codes (same location, dropdown-compatible)
  'Antigua Helipad': 'ANTIGUA',
  'Lake Atitlán Helipad': 'ATITLAN',
  'Tikal Helipad': 'TIKAL',
  // Destination names → codes
  'Guatemala City': 'GUA',
  'Mixco': 'GUA',
  'Villa Nueva': 'GUA',
  'Antigua Guatemala': 'ANTIGUA',
  'Ciudad Vieja': 'ANTIGUA',
  'San Lucas': 'ANTIGUA',
  'Alotenango': 'ANTIGUA',
  'Panajachel': 'ATITLAN',
  'San Pedro La Laguna': 'ATITLAN',
  'Santiago Atitlán': 'ATITLAN',
  'Flores': 'FRS',
  'Tikal': 'TIKAL',
  'Yaxha': 'FRS',
  'El Remate': 'FRS',
  'El Mirador': 'FRS',
  'Puerto Barrios': 'PBR',
  'Río Dulce': 'RIO_DULCE',
  'Livingston': 'LIVINGSTON',
  'El Estor': 'PBR',
  'Quetzaltenango': 'XELA',
  'Zunil': 'XELA',
  'Almolonga': 'XELA',
  'Retalhuleu': 'RER',
  'Champerico': 'RER',
  'El Asintal': 'RER',
  'Cobán': 'COBAN',
  'Lanquín': 'SEMUC',
  'Semuc Champey': 'SEMUC',
  'Huehuetenango': 'HUEHUE',
  'Todos Santos': 'HUEHUE',
  'Nentón': 'HUEHUE',
  'Escuintla': 'ESCUINTLA',
  'Puerto San José': 'ESCUINTLA',
  'Monterrico': 'MONTERRICO',
  'El Paredón': 'MONTERRICO',
  // Remaining departments mapped to nearest airport/hub
  'Zacapa': 'ZAC',
  'Estanzuela': 'ZAC',
  'Río Hondo': 'ZAC',
  'Chiquimula': 'ZAC',
  'Esquipulas': 'ZAC',
  'Jocotán': 'ZAC',
  'Jalapa': 'GUA',
  'Monjas': 'GUA',
  'Mataquescuintla': 'GUA',
  'Cuilapa': 'ESCUINTLA',
  'Barberena': 'ESCUINTLA',
  'Guazacapán': 'ESCUINTLA',
  'Salamá': 'COBAN',
  'Rabinal': 'COBAN',
  'Cubulco': 'COBAN',
  'Jutiapa': 'ESCUINTLA',
  'Asunción Mita': 'ESCUINTLA',
  'Atescatempa': 'ESCUINTLA',
  'Guastatoya': 'GUA',
  'Sanarate': 'GUA',
  'Morazán': 'GUA',
  'Totonicapán': 'XELA',
  'San Cristóbal': 'XELA',
  'San Francisco El Alto': 'XELA',
  'Santa Cruz del Quiché': 'AAZ',
  'Chichicastenango': 'AAZ',
  'Nebaj': 'AAZ',
  'Mazatenango': 'RER',
  'San Antonio': 'RER',
  'Chicacao': 'RER',
  'Chimaltenango': 'GUA',
  'San Martín Jilotepeque': 'GUA',
  'Patzún': 'GUA',
  'San Marcos': 'XELA',
  'San Pedro Sacatepéquez': 'XELA',
  'Malacatán': 'XELA',
}

// Resolve a destination name or airport name to a location code
function resolveToCode(destination: string): string {
  if (DESTINATION_TO_CODE[destination]) return DESTINATION_TO_CODE[destination]
  if (LOCATION_COORDINATES[destination.toUpperCase()]) return destination.toUpperCase()
  return destination
}

export default function BookTransportPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const { t, locale } = useTranslation()
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
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null)
  const [selectionMode, setSelectionMode] = useState<'dropdown' | 'map'>('dropdown')
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [showDestinationModal, setShowDestinationModal] = useState(false)
  const [modalType, setModalType] = useState<'from' | 'to'>('from')
  const [mapCollapsed, setMapCollapsed] = useState(false)
  const [showPhoneGate, setShowPhoneGate] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneSaving, setPhoneSaving] = useState(false)

  // Auth gate state (inline sign-up/login at checkout)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    fetchAirports()
  }, [])

  // Pre-populate form from URL search params (e.g., homepage map selection)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    const to = params.get('to')
    const passengers = params.get('passengers')

    if (!from && !to && !passengers) return

    const resolveLocation = (param: string): string => {
      if (DEPARTMENT_TO_LOCATION[param]) return DEPARTMENT_TO_LOCATION[param]
      if (LOCATION_COORDINATES[param.toUpperCase()]) return param.toUpperCase()
      return ''
    }

    setFormData(prev => ({
      ...prev,
      ...(from ? { fromLocation: resolveLocation(from) } : {}),
      ...(to ? { toLocation: resolveLocation(to) } : {}),
      ...(passengers ? { passengers: Math.min(6, Math.max(1, parseInt(passengers) || 1)) } : {}),
    }))
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
    const code = resolveToCode(location)
    setFormData(prev => ({
      ...prev,
      [type === 'from' ? 'fromLocation' : 'toLocation']: code
    }))
  }

  const handleDepartmentClick = (dept: Department) => {
    // If department has only one destination, select it directly
    if (dept.destinations.length === 1) {
      const code = resolveToCode(dept.destinations[0])
      if (!formData.fromLocation) {
        setFormData(prev => ({ ...prev, fromLocation: code }))
      } else if (!formData.toLocation) {
        setFormData(prev => ({ ...prev, toLocation: code }))
      } else {
        setFormData(prev => ({ ...prev, fromLocation: code }))
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

    // Use getState() to always get the latest profile (important after auth gate or phone gate)
    const currentProfile = useAuthStore.getState().profile

    // Show inline auth gate instead of redirecting to login page
    if (!currentProfile?.id) {
      setShowAuthGate(true)
      return
    }

    // Require phone number before booking
    if (!currentProfile.phone) {
      setShowPhoneGate(true)
      return
    }

    // Validate date is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(formData.date)
    if (selectedDate < today) {
      setError(locale === 'es' ? 'La fecha de salida no puede ser en el pasado' : 'Departure date cannot be in the past')
      return
    }

    // Validate return date if round trip
    if (formData.isRoundTrip && formData.returnDate) {
      const returnDate = new Date(formData.returnDate)
      if (returnDate < selectedDate) {
        setError(locale === 'es' ? 'La fecha de regreso debe ser igual o posterior a la de salida' : 'Return date must be on or after departure date')
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
          price_breakdown: priceBreakdown ? {
            distance: priceBreakdown.distance,
            flightTime: priceBreakdown.flightTime,
            basePrice: priceBreakdown.basePrice,
            passengerFee: priceBreakdown.passengerFee || 0,
            multiplier: priceBreakdown.multiplier || null,
            isRoundTrip: priceBreakdown.isRoundTrip || false
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

  const savePhoneAndBook = async () => {
    if (!phoneInput.trim()) return
    setPhoneSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phoneInput.trim() })
      })
      if (!res.ok) throw new Error('Failed to save phone')
      const currentProfile = useAuthStore.getState().profile
      useAuthStore.getState().setProfile({ ...currentProfile!, phone: phoneInput.trim() })
      setShowPhoneGate(false)
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
      await handleSubmit(syntheticEvent)
    } catch {
      setError(locale === 'es' ? 'No se pudo guardar el número. Intenta de nuevo.' : 'Could not save phone number. Please try again.')
    } finally {
      setPhoneSaving(false)
    }
  }

  const handleAuthSubmit = async () => {
    setAuthLoading(true)
    setAuthError('')

    try {
      let result
      if (authMode === 'register') {
        if (!authName.trim()) {
          setAuthError(locale === 'es' ? 'Nombre requerido' : 'Name is required')
          setAuthLoading(false)
          return
        }
        result = await authRegister({
          email: authEmail.trim(),
          password: authPassword,
          fullName: authName.trim(),
          phone: authPhone.trim() || undefined,
          role: 'client'
        })
      } else {
        result = await authLogin(authEmail.trim(), authPassword)
      }

      if (!result.success || !result.user) {
        throw new Error(result.error || (locale === 'es' ? 'Error de autenticación' : 'Authentication failed'))
      }

      // Update auth store
      useAuthStore.getState().setUser(result.user)
      useAuthStore.getState().setProfile(result.user)

      // Wait for cookie to be processed
      await new Promise(resolve => setTimeout(resolve, 150))

      setShowAuthGate(false)

      // Auto-submit the booking form
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
      await handleSubmit(syntheticEvent)
    } catch (err: any) {
      setAuthError(err.message || (locale === 'es' ? 'Error de autenticación' : 'Authentication failed'))
    } finally {
      setAuthLoading(false)
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
        {/* Booking progress */}
        <div className="flex items-center justify-center gap-0 mb-6 sm:mb-8">
          {[
            { n: 1, label: locale === 'es' ? 'Vuelo' : 'Flight' },
            { n: 2, label: locale === 'es' ? 'Pasajeros' : 'Passengers' },
            { n: 3, label: locale === 'es' ? 'Confirmación' : 'Confirmation' },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center">
              {i > 0 && <div className="w-12 sm:w-20 h-0.5 bg-gray-300 dark:bg-gray-600" />}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.n === 1 ? 'bg-primary-600 dark:bg-gold-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {step.n}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${step.n === 1 ? 'text-primary-600 dark:text-gold-400 font-medium' : 'text-gray-400'}`}>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
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
                    <option value="RIO_DULCE">Río Dulce</option>
                    <option value="COBAN">Cobán</option>
                    <option value="XELA">Quetzaltenango</option>
                    <option value="HUEHUE">Huehuetenango</option>
                    <option value="ESCUINTLA">Escuintla</option>
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
                    <option value="RIO_DULCE">Río Dulce</option>
                    <option value="COBAN">Cobán</option>
                    <option value="XELA">Quetzaltenango</option>
                    <option value="HUEHUE">Huehuetenango</option>
                    <option value="ESCUINTLA">Escuintla</option>
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
                          {formData.fromLocation ? getLocationName(formData.fromLocation, formData.fromCustom) : 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">To:</span>
                        <p className="font-medium text-amber-400">
                          {formData.toLocation ? getLocationName(formData.toLocation, formData.toCustom) : 'Not selected'}
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
            
            {priceBreakdown && (
              <div className="space-y-2 text-sm text-primary-800 dark:text-gray-300 mb-4">
                <div className="flex justify-between">
                  <span>{t('pricing.distance')}:</span>
                  <span>{priceBreakdown.distance} km {priceBreakdown.isRoundTrip ? t('booking.form.each_way') : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pricing.flight_time')}:</span>
                  <span>{priceBreakdown.flightTime} minutes {priceBreakdown.isRoundTrip ? t('booking.form.each_way') : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>{priceBreakdown.isRoundTrip ? t('booking.form.one_way_price') : t('booking.form.estimated_price')}</span>
                  <span>${Math.round(priceBreakdown.basePrice / (priceBreakdown.multiplier || 1))}</span>
                </div>
                {priceBreakdown.isRoundTrip && (
                  <div className="flex justify-between">
                    <span>Round Trip Multiplier:</span>
                    <span>×{priceBreakdown.multiplier} {priceBreakdown.multiplier === 1.8 ? '(Same Day Discount)' : ''}</span>
                  </div>
                )}
                {priceBreakdown.passengerFee > 0 && (
                  <div className="flex justify-between">
                    <span>{t('pricing.additional_passengers')}:</span>
                    <span>+${priceBreakdown.passengerFee}</span>
                  </div>
                )}
                <div className="border-t border-primary-300 dark:border-gray-600 pt-2 flex justify-between font-semibold">
                  <span>{t('pricing.total')} {priceBreakdown.isRoundTrip ? t('booking.form.round_trip') : ''} {t('pricing.base_price')}:</span>
                  <span>${priceBreakdown.totalPrice}</span>
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

      {/* Auth Gate Modal - inline sign-up/login at checkout */}
      {showAuthGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-gold-500/20 mb-3">
              <Lock className="h-6 w-6 text-primary-600 dark:text-gold-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {authMode === 'register'
                ? (locale === 'es' ? 'Crear cuenta para reservar' : 'Create account to book')
                : (locale === 'es' ? 'Iniciar sesión' : 'Sign in to book')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {locale === 'es'
                ? 'Crea tu cuenta para completar la reserva y recibir confirmación.'
                : 'Create your account to complete booking and receive confirmation.'}
            </p>

            {authError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm mb-3">
                {authError}
              </div>
            )}

            <div className="space-y-3">
              {authMode === 'register' && (
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'es' ? 'Nombre completo' : 'Full name'}
                />
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'es' ? 'Correo electrónico' : 'Email address'}
                  autoFocus
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                  placeholder={locale === 'es' ? 'Contraseña' : 'Password'}
                />
              </div>
              {authMode === 'register' && (
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500"
                    placeholder="+502 5550-0000 (WhatsApp)"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => { setShowAuthGate(false); setAuthError('') }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleAuthSubmit}
                disabled={authLoading || !authEmail.trim() || !authPassword.trim()}
                className="flex-1 px-4 py-2 btn-luxury text-sm disabled:opacity-50"
              >
                {authLoading ? '...' : authMode === 'register'
                  ? (locale === 'es' ? 'Crear y reservar' : 'Create & book')
                  : (locale === 'es' ? 'Entrar y reservar' : 'Sign in & book')}
              </button>
            </div>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError('') }}
                className="text-xs text-primary-600 dark:text-gold-400 hover:underline"
              >
                {authMode === 'register'
                  ? (locale === 'es' ? '¿Ya tienes cuenta? Inicia sesión' : 'Already have an account? Sign in')
                  : (locale === 'es' ? '¿No tienes cuenta? Regístrate' : "Don't have an account? Sign up")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Gate Modal */}
      {showPhoneGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
              <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {locale === 'es' ? '¡Casi listo!' : 'Almost there!'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {locale === 'es'
                ? 'Necesitamos tu WhatsApp para enviarte la confirmación y actualizaciones de vuelo en tiempo real.'
                : 'We need your WhatsApp to send your booking confirmation and real-time flight updates.'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
              {locale === 'es' ? 'Tu número nunca se comparte con terceros.' : 'Your number is never shared with third parties.'}
            </p>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded mb-4 focus:ring-2 focus:ring-primary-500"
              placeholder="+502 5550-0000"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPhoneGate(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={savePhoneAndBook}
                disabled={phoneSaving || !phoneInput.trim()}
                className="flex-1 px-4 py-2 btn-luxury text-sm disabled:opacity-50"
              >
                {phoneSaving ? 'Saving…' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

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