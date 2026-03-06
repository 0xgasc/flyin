'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { useToast } from '@/lib/toast-store'
import { Users, Plus, Trash2, ShoppingCart, DollarSign, AlertTriangle, Briefcase } from 'lucide-react'
import { MobileNav } from '@/components/mobile-nav'
import { useTranslation } from '@/lib/i18n'
import { FormInput } from '@/components/form-input'
import { logger } from '@/lib/logger'
import { validateRequired, validateNumberRange } from '@/lib/validation'
import { getErrorMessage } from '@/types/api.types'

interface PassengerDetails {
  name: string
  age: number
  weight_lbs: number
  passport: string
  emergency_contact_name: string
  emergency_contact_phone: string
  dietary_restrictions: string
  special_requests: string
  baggage_type: string
  baggage_weight_lbs: number
  baggage_notes: string
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
  const toast = useToast()
  const { t, locale } = useTranslation()

  // Get booking ID from URL params
  const bookingId = searchParams.get('booking_id')

  // State for actual booking data from database
  const [bookingData, setBookingData] = useState<{
    booking_id: string | null
    booking_type: string
    passenger_count: number
    base_price: number // Actual price from database - NOT from URL
    from_location: string
    to_location: string
    experience_name: string
    date: string
    time: string
  } | null>(null)

  const [passengers, setPassengers] = useState<PassengerDetails[]>([])
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([])
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([])
  const [loading, setLoading] = useState(true) // Start loading
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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
          booking_type: booking.booking_type || 'transport',
          passenger_count: booking.passenger_count || 1,
          base_price: booking.total_price, // Use price from database, NOT URL
          from_location: booking.from_location || '',
          to_location: booking.to_location || '',
          experience_name: booking.experience?.name || '',
          date: booking.scheduled_date || '',
          time: booking.scheduled_time || ''
        })

        // Initialize passenger forms
        const initialPassengers = Array.from({ length: booking.passenger_count || 1 }, (_, i) => ({
          name: i === 0 ? profile?.fullName || '' : '',
          age: 25,
          weight_lbs: 0,
          passport: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          dietary_restrictions: '',
          special_requests: '',
          baggage_type: 'none',
          baggage_weight_lbs: 0,
          baggage_notes: ''
        }))
        setPassengers(initialPassengers)
      } catch (err) {
        setError(getErrorMessage(err))
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
        const addonsWithQuantity = data.addons.map((addon: Omit<Addon, 'quantity'>) => ({ ...addon, quantity: 0 }))
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
      logger.warn('Addons fetch error:', err)
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

    // Real-time validation
    validatePassengerField(index, field, value)
  }

  const validatePassengerField = (index: number, field: keyof PassengerDetails, value: string | number) => {
    const key = `passenger-${index}-${field}`

    if (field === 'name') {
      const result = validateRequired(value as string, `Passenger ${index + 1} name`)
      if (!result.isValid) {
        setFieldErrors(prev => ({ ...prev, [key]: result.errors[0] }))
      } else {
        setFieldErrors(prev => {
          const { [key]: _, ...rest } = prev
          return rest
        })
      }
    }

    if (field === 'age') {
      const result = validateNumberRange(value as number, 1, 120, 'Age')
      if (!result.isValid) {
        setFieldErrors(prev => ({ ...prev, [key]: result.errors[0] }))
      } else {
        setFieldErrors(prev => {
          const { [key]: _, ...rest } = prev
          return rest
        })
      }
    }
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

      // Transform passenger fields from frontend snake_case to DB camelCase
      const transformedPassengers = passengers.map(p => ({
        name: p.name,
        age: p.age,
        weightLbs: p.weight_lbs,
        passport: p.passport,
        emergencyContact: [p.emergency_contact_name, p.emergency_contact_phone].filter(Boolean).join(' — '),
        dietaryRestrictions: p.dietary_restrictions,
        specialRequests: p.special_requests,
        baggageType: p.baggage_type,
        baggageWeightLbs: p.baggage_weight_lbs,
        baggageNotes: p.baggage_notes
      }))

      // Transform addon fields from frontend snake_case to DB camelCase
      const transformedAddons = selectedAddons.map(a => ({
        addonId: a.addon_id,
        quantity: a.quantity,
        unitPrice: a.unit_price
      }))

      // Update booking with passenger details and addons
      const response = await fetch(`/api/bookings/${bookingData.booking_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          passenger_details: transformedPassengers,
          selected_addons: transformedAddons,
          addon_total_price: addonTotal,
          total_price: grandTotal // Calculated from database base_price, not URL
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save passenger details')
      }

      // Redirect to payment confirmation
      toast.success('Passenger details saved! Proceeding to payment...')
      router.push(`/dashboard?highlight=${bookingData.booking_id}`)

    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'service': return ''
      case 'comfort': return ''
      case 'catering': return ''
      case 'equipment': return ''
      default: return ''
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
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded p-6 max-w-md text-center">
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
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      <MobileNav />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Booking progress */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {[
            { n: 1, label: locale === 'es' ? 'Vuelo' : 'Flight' },
            { n: 2, label: locale === 'es' ? 'Pasajeros' : 'Passengers' },
            { n: 3, label: locale === 'es' ? 'Confirmación' : 'Confirmation' },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center">
              {i > 0 && <div className={`w-12 sm:w-20 h-0.5 ${step.n <= 2 ? 'bg-primary-600 dark:bg-gold-500' : 'bg-gray-300 dark:bg-gray-600'}`} />}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.n <= 2 ? 'bg-primary-600 dark:bg-gold-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {step.n === 1 ? '✓' : step.n}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${step.n === 2 ? 'text-primary-600 dark:text-gold-400 font-medium' : step.n === 1 ? 'text-gray-400' : 'text-gray-400'}`}>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('passenger.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {bookingData.booking_type === 'experience'
              ? `${bookingData.experience_name} — ${bookingData.date ? new Date(bookingData.date).toLocaleDateString() : ''} at ${bookingData.time}`
              : `Flight: ${bookingData.from_location} → ${bookingData.to_location} — ${bookingData.date ? new Date(bookingData.date).toLocaleDateString() : ''} at ${bookingData.time}`
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                    {locale === 'es' ? 'Pasajero' : 'Passenger'} {index + 1} {index === 0 && (locale === 'es' ? '(Principal)' : '(Primary)')}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                      label={t('passenger.name')}
                      value={passenger.name}
                      onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                      error={fieldErrors[`passenger-${index}-name`]}
                      required
                      placeholder={locale === 'es' ? 'Ej: Juan García' : 'e.g., John Smith'}
                    />

                    <FormInput
                      type="number"
                      label={t('passenger.age')}
                      value={passenger.age.toString()}
                      onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 0)}
                      error={fieldErrors[`passenger-${index}-age`]}
                      min={1}
                      max={120}
                      required
                    />

                    <FormInput
                      type="number"
                      label={locale === 'es' ? 'Peso (LB)' : 'Weight (LB)'}
                      value={passenger.weight_lbs ? passenger.weight_lbs.toString() : ''}
                      onChange={(e) => updatePassenger(index, 'weight_lbs', parseInt(e.target.value) || 0)}
                      min={1}
                      max={400}
                      required
                      placeholder="e.g., 175"
                      hint={locale === 'es' ? 'Requerido para seguridad de vuelo' : 'Required for flight safety'}
                    />

                    <FormInput
                      label={t('passenger.passport')}
                      value={passenger.passport}
                      onChange={(e) => updatePassenger(index, 'passport', e.target.value)}
                      placeholder={locale === 'es' ? 'Pasaporte o DPI' : 'Passport or ID number'}
                    />

                    <FormInput
                      label={`${t('passenger.emergency_contact')} — ${locale === 'es' ? 'Nombre' : 'Name'}`}
                      value={passenger.emergency_contact_name}
                      onChange={(e) => updatePassenger(index, 'emergency_contact_name', e.target.value)}
                      placeholder={locale === 'es' ? 'Nombre completo' : 'Full name'}
                    />

                    <FormInput
                      type="tel"
                      label={`${t('passenger.emergency_contact')} — ${locale === 'es' ? 'Teléfono' : 'Phone'}`}
                      value={passenger.emergency_contact_phone}
                      onChange={(e) => updatePassenger(index, 'emergency_contact_phone', e.target.value)}
                      placeholder="+502 5550-0000"
                    />
                  </div>

                  {/* Baggage Section */}
                  <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary-600 dark:text-gold-400" />
                      {locale === 'es' ? 'Equipaje' : 'Baggage'}
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {locale === 'es' ? 'Tipo de equipaje' : 'Baggage type'}
                        </label>
                        <select
                          value={passenger.baggage_type}
                          onChange={(e) => updatePassenger(index, 'baggage_type', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="none">{locale === 'es' ? 'Sin equipaje' : 'No baggage'}</option>
                          <option value="small_backpack">{locale === 'es' ? 'Mochila pequeña / bolsa personal' : 'Small backpack / personal bag'}</option>
                          <option value="duffel_bag">{locale === 'es' ? 'Bolsa de lona / duffel bag' : 'Duffel bag / soft bag'}</option>
                          <option value="hiking_gear">{locale === 'es' ? 'Equipo de senderismo' : 'Hiking / outdoor gear'}</option>
                          <option value="instrument">{locale === 'es' ? 'Instrumento musical' : 'Musical instrument'}</option>
                          <option value="large_suitcase">{locale === 'es' ? 'Maleta grande / rígida' : 'Large / hard-shell suitcase'}</option>
                          <option value="oversized">{locale === 'es' ? 'Equipaje sobredimensionado' : 'Oversized item'}</option>
                        </select>
                      </div>

                      {passenger.baggage_type !== 'none' && (
                        <FormInput
                          type="number"
                          label={locale === 'es' ? 'Peso estimado (LB)' : 'Estimated weight (LB)'}
                          value={passenger.baggage_weight_lbs ? passenger.baggage_weight_lbs.toString() : ''}
                          onChange={(e) => updatePassenger(index, 'baggage_weight_lbs', parseInt(e.target.value) || 0)}
                          min={1}
                          max={200}
                          placeholder="e.g., 30"
                        />
                      )}
                    </div>

                    {/* Baggage warnings */}
                    {passenger.baggage_type === 'large_suitcase' && (
                      <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          {locale === 'es'
                            ? 'Las maletas rígidas/grandes NO caben en la mayoría de helicópteros. Se recomienda bolsa de lona (duffel bag). Si necesita enviar su maleta, podemos organizarla vía transporte terrestre por un costo adicional.'
                            : 'Hard-shell / large suitcases do NOT fit in most helicopters. We strongly recommend soft duffel bags instead. If you need your suitcase transported, we can arrange ground shipping for an additional fee.'}
                        </p>
                      </div>
                    )}

                    {passenger.baggage_type === 'oversized' && (
                      <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          {locale === 'es'
                            ? 'Artículos sobredimensionados pueden requerir un asiento adicional o transporte terrestre separado. Nuestro equipo le contactará para coordinar la logística.'
                            : 'Oversized items may require an extra seat or separate ground transport. Our team will contact you to coordinate logistics.'}
                        </p>
                      </div>
                    )}

                    {passenger.baggage_weight_lbs > 50 && (
                      <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          {locale === 'es'
                            ? 'Equipaje de más de 50 lb solo es posible en aeronaves Robinson R66 o superiores. Esto será considerado en su cotización.'
                            : 'Baggage over 50 lb is only possible on Robinson R66 or larger aircraft. This will be factored into your quote.'}
                        </p>
                      </div>
                    )}

                    {passenger.baggage_type !== 'none' && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {locale === 'es' ? 'Notas sobre equipaje' : 'Baggage notes'}
                        </label>
                        <input
                          type="text"
                          value={passenger.baggage_notes}
                          onChange={(e) => updatePassenger(index, 'baggage_notes', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder={locale === 'es' ? 'Describa su equipaje, dimensiones, contenido especial...' : 'Describe your baggage, dimensions, special contents...'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Special requests */}
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <FormInput
                      label={t('passenger.dietary')}
                      value={passenger.dietary_restrictions}
                      onChange={(e) => updatePassenger(index, 'dietary_restrictions', e.target.value)}
                      placeholder={locale === 'es' ? 'Alergias, vegetariano, etc.' : 'Allergies, vegetarian, etc.'}
                    />
                    <FormInput
                      label={t('passenger.special_requests')}
                      value={passenger.special_requests}
                      onChange={(e) => updatePassenger(index, 'special_requests', e.target.value)}
                      placeholder={locale === 'es' ? 'Asistencia de movilidad, etc.' : 'Mobility assistance, etc.'}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Helicopter baggage guidelines */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {locale === 'es' ? 'Lineamientos de equipaje para helicóptero' : 'Helicopter Baggage Guidelines'}
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• {locale === 'es' ? 'Bolsas de lona / duffel bags recomendadas (son flexibles y caben mejor)' : 'Duffel bags / soft bags recommended (flexible, fit better in cargo)'}</li>
                <li>• {locale === 'es' ? 'Maletas rígidas grandes NO caben — use transporte terrestre' : 'Large hard-shell suitcases do NOT fit — use ground transport instead'}</li>
                <li>• {locale === 'es' ? 'Máximo ~50 lb por pasajero en la mayoría de helicópteros' : 'Max ~50 lb per passenger in most helicopters'}</li>
                <li>• {locale === 'es' ? 'Equipaje de más de 50 lb requiere aeronave R66 o superior' : 'Baggage over 50 lb requires R66 or larger aircraft'}</li>
                <li>• {locale === 'es' ? 'Instrumentos musicales y equipo de senderismo: OK con nota previa' : 'Musical instruments & hiking gear: OK with advance notice'}</li>
                <li>• {locale === 'es' ? 'Artículos sobredimensionados pueden requerir un asiento extra' : 'Oversized items may need an extra seat or separate ground shipping'}</li>
              </ul>
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
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                    {getCategoryIcon(category)} {category} Add-ons
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {addons.map((addon) => (
                      <div key={addon.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{addon.name}</h4>
                            <span className="text-lg font-bold text-primary-600">${addon.price}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{addon.description}</p>
                          
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                            <button
                              type="button"
                              onClick={() => updateAddonQuantity(addon.id, Math.max(0, addon.quantity - 1))}
                              aria-label={`Decrease ${addon.name} quantity`}
                              disabled={addon.quantity === 0}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium text-gray-900 dark:text-white" aria-live="polite">{addon.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateAddonQuantity(addon.id, addon.quantity + 1)}
                              aria-label={`Increase ${addon.name} quantity`}
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
          <div className="card-luxury bg-primary-50 dark:bg-gray-800 border-primary-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold flex items-center mb-4 text-gray-900 dark:text-white">
              <DollarSign className="h-5 w-5 mr-2 text-primary-600 dark:text-gold-400" />
              {locale === 'es' ? 'Resumen de precio' : 'Price Summary'}
            </h2>

            <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
              <div className="flex justify-between">
                <span>{locale === 'es' ? 'Precio base del vuelo' : 'Base Flight Price'}:</span>
                <span>${bookingData.base_price.toFixed(2)}</span>
              </div>

              {selectedAddons.length > 0 && (
                <>
                  <div className="border-t border-primary-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="font-medium text-primary-800 dark:text-gold-400 mb-1">{locale === 'es' ? 'Complementos' : 'Add-ons'}:</div>
                    {selectedAddons.map((addon) => {
                      const addonInfo = availableAddons.find(a => a.id === addon.addon_id)
                      return (
                        <div key={addon.addon_id} className="flex justify-between text-xs ml-4">
                          <span>{addonInfo?.name} x {addon.quantity}:</span>
                          <span>${(addon.quantity * addon.unit_price).toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{locale === 'es' ? 'Subtotal complementos' : 'Add-ons Subtotal'}:</span>
                    <span>${calculateAddonTotal().toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="border-t border-primary-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary-800 dark:text-gold-400">${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              {t('passenger.back')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="flex-1 btn-luxury disabled:opacity-50"
            >
              {submitting ? t('common.loading') : t('passenger.continue')}
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
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <PassengerDetailsContent />
    </Suspense>
  )
}