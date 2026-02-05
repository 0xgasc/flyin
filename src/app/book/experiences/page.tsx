'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useTranslation } from '@/lib/i18n'
import { MobileNav } from '@/components/mobile-nav'
import { QuickSignUpModal } from '@/components/quick-signup-modal'
import { BookingIntent } from '@/components/experience-booking-modal'
import { useAuthStore } from '@/lib/auth-store'
import { getAuthHeaders } from '@/lib/auth-client'
import { Users, Clock, MapPin, Plane, ChevronDown, ChevronUp, Check, Minus, Plus } from 'lucide-react'


interface PricingTier {
  id: string
  min_passengers: number
  max_passengers: number
  price: number
}

interface Experience {
  id: string
  name: string
  name_es: string | null
  description: string
  description_es: string | null
  duration_hours: number
  duration_minutes: number | null
  base_price: number
  max_passengers: number
  min_passengers: number
  includes: string[]
  includes_es: string[] | null
  location: string
  aircraft_options: any
  route_waypoints: string[]
  category: string
  image_url: string | null
  category_name_en: string | null
  category_name_es: string | null
  type: 'experience' | 'destination'
  order_index?: number | null
  pricing_tiers?: PricingTier[]
  experience_images?: Array<{
    id: string
    image_url: string
    caption: string | null
    is_primary: boolean
    order_index: number | null
  }>
  destination_images?: Array<{
    id: string
    image_url: string
    caption: string | null
    is_primary: boolean
    order_index: number | null
  }>
}

// Inline booking card component
function BookingCard({
  experience,
  locale,
  onClose,
  onSignUpRequired
}: {
  experience: Experience
  locale: string
  onClose: () => void
  onSignUpRequired: (intent: BookingIntent) => void
}) {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [passengerCount, setPassengerCount] = useState(experience.min_passengers || 1)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const getDisplayName = () => {
    return locale === 'es' && experience.name_es ? experience.name_es : experience.name
  }

  // Calculate price based on pricing tiers
  const calculatePrice = (passengers: number): number => {
    if (experience.pricing_tiers && experience.pricing_tiers.length > 0) {
      const tier = experience.pricing_tiers.find(t =>
        passengers >= t.min_passengers && passengers <= t.max_passengers
      )
      if (tier) return tier.price

      const sortedTiers = [...experience.pricing_tiers].sort((a, b) => a.min_passengers - b.min_passengers)
      for (const t of sortedTiers) {
        if (passengers <= t.max_passengers) return t.price
      }
      return sortedTiers[sortedTiers.length - 1]?.price || experience.base_price * passengers
    }
    return experience.base_price * passengers
  }

  const totalPrice = calculatePrice(passengerCount)
  const pricePerPerson = Math.round(totalPrice / passengerCount)

  const handlePassengerChange = (delta: number) => {
    const newCount = passengerCount + delta
    if (newCount >= experience.min_passengers && newCount <= experience.max_passengers) {
      setPassengerCount(newCount)
    }
  }

  const handleBook = async () => {
    if (!scheduledDate) {
      setError(locale === 'es' ? 'Selecciona una fecha' : 'Select a date')
      return
    }

    const bookingIntent: BookingIntent = {
      experienceId: experience.id,
      experienceName: getDisplayName(),
      passengerCount,
      scheduledDate,
      scheduledTime,
      totalPrice,
      type: experience.type
    }

    if (!profile) {
      localStorage.setItem('booking-intent', JSON.stringify(bookingIntent))
      onSignUpRequired(bookingIntent)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          booking_type: 'experience',
          experience_id: experience.id,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          passenger_count: passengerCount,
          total_price: totalPrice,
          price_breakdown: {
            base_price: totalPrice,
            passengers: passengerCount,
            per_person: pricePerPerson
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      sessionStorage.setItem('lastBookingId', data.booking.id)
      sessionStorage.setItem('lastBooking', JSON.stringify({
        ...data.booking,
        experienceName: getDisplayName()
      }))

      router.push(`/book/passenger-details?booking_id=${data.booking.id}`)
    } catch (err: any) {
      setError(err.message || (locale === 'es' ? 'Error al crear la reserva' : 'Failed to create booking'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-4">
      {/* Price Display */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900">
            ${totalPrice.toLocaleString()} <span className="text-base font-normal text-slate-500">USD</span>
          </div>
          <div className="text-sm text-slate-500">
            ${pricePerPerson} {locale === 'es' ? 'por persona' : 'per person'}
          </div>
        </div>
      </div>

      {/* Passengers */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {locale === 'es' ? 'Pasajeros' : 'Passengers'}
        </label>
        <div className="flex items-center justify-center gap-4 bg-white rounded-lg border border-slate-200 p-3">
          <button
            onClick={() => handlePassengerChange(-1)}
            disabled={passengerCount <= experience.min_passengers}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="text-2xl font-bold text-slate-900 min-w-[3rem] text-center">
            {passengerCount}
          </span>
          <button
            onClick={() => handlePassengerChange(1)}
            disabled={passengerCount >= experience.max_passengers}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {locale === 'es' ? 'Fecha' : 'Date'}
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={today}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {locale === 'es' ? 'Hora' : 'Time'}
          </label>
          <select
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {timeOptions.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleBook}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting
            ? (locale === 'es' ? 'Procesando...' : 'Processing...')
            : (locale === 'es' ? 'Confirmar Reserva' : 'Confirm Booking')
          }
        </button>
        <button
          onClick={onClose}
          className="px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {locale === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>
    </div>
  )
}

export default function BookExperiencesPage() {
  const router = useRouter()

  const { t, locale } = useTranslation()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // Sign up modal state
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [bookingIntent, setBookingIntent] = useState<BookingIntent | null>(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⏰ Query timeout after 15 seconds')
        setLoading(false)
      }
    }, 15000)

    fetchExperiences()

    return () => clearTimeout(timeoutId)
  }, [])

  const fetchExperiences = async () => {
    setLoading(true)

    try {
      const [experiencesResponse, destinationsResponse] = await Promise.all([
        fetch('/api/experiences'),
        fetch('/api/destinations?include_images=true')
      ])

      const experiencesData = await experiencesResponse.json()
      const destinationsData = await destinationsResponse.json()

      const allItems: Experience[] = []
      const allCategories = new Set(['experiences', 'destinations'])

      if (experiencesData.success && experiencesData.experiences?.length > 0) {
        const experienceItems = experiencesData.experiences.map((exp: any) => ({
          id: exp.id,
          name: exp.name,
          name_es: exp.name_es,
          description: exp.description,
          description_es: exp.description_es,
          duration_hours: exp.duration_hours,
          duration_minutes: exp.duration_minutes,
          base_price: exp.base_price,
          max_passengers: exp.max_passengers,
          min_passengers: exp.min_passengers || 1,
          includes: exp.includes || [],
          includes_es: exp.includes_es,
          location: exp.location,
          aircraft_options: exp.aircraft_options,
          route_waypoints: exp.route_waypoints || [],
          category: 'experiences',
          image_url: exp.image_url,
          category_name_en: exp.category_name_en,
          category_name_es: exp.category_name_es,
          type: 'experience' as const,
          order_index: exp.order_index,
          pricing_tiers: exp.pricing_tiers || [],
          experience_images: exp.experience_images || []
        }))
        allItems.push(...experienceItems)
      }

      if (destinationsData.success && destinationsData.destinations?.length > 0) {
        const destinationItems = destinationsData.destinations.map((dest: any) => ({
          id: dest.id,
          name: dest.name,
          name_es: null,
          description: dest.description,
          description_es: null,
          duration_hours: 0,
          duration_minutes: null,
          base_price: 0,
          max_passengers: 8,
          min_passengers: 1,
          includes: dest.features || [],
          includes_es: null,
          location: dest.location,
          aircraft_options: null,
          route_waypoints: [],
          category: 'destinations',
          image_url: null,
          category_name_en: 'Destinations',
          category_name_es: 'Destinos',
          type: 'destination' as const,
          destination_images: dest.destination_images || [],
          order_index: dest.order_index
        }))
        allItems.push(...destinationItems)
      }

      const sortedItems = allItems.sort((a, b) => {
        const aOrder = a.order_index ?? 999
        const bOrder = b.order_index ?? 999
        return aOrder - bOrder
      })

      setExperiences(sortedItems)
      setCategories(Array.from(allCategories))

    } catch (error) {
      console.error('❌ Error fetching data:', error)
      setError('Failed to load experiences and destinations')
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (experience: Experience) => {
    return locale === 'es' && experience.name_es ? experience.name_es : experience.name
  }

  const getCategoryName = (experience: Experience) => {
    if (experience.type === 'destination') {
      return locale === 'es' ? 'Destino' : 'Destination'
    }
    return locale === 'es' ? 'Sobrevuelo Panorámico' : 'Panoramic Flight'
  }

  const getDisplayIncludes = (experience: Experience) => {
    return locale === 'es' && experience.includes_es ? experience.includes_es : experience.includes
  }

  // Get display price - use lowest tier price if available
  const getDisplayPrice = (experience: Experience): number => {
    if (experience.pricing_tiers && experience.pricing_tiers.length > 0) {
      const lowestTier = experience.pricing_tiers.reduce((min, tier) =>
        tier.price < min.price ? tier : min
      , experience.pricing_tiers[0])
      return lowestTier.price
    }
    return experience.base_price
  }

  const hasValidPrice = (experience: Experience): boolean => {
    if (experience.pricing_tiers && experience.pricing_tiers.length > 0) {
      return experience.pricing_tiers.some(t => t.price > 0)
    }
    return experience.base_price > 0
  }

  // Format pricing tiers for display
  const formatPricingTiers = (experience: Experience) => {
    if (!experience.pricing_tiers || experience.pricing_tiers.length === 0) {
      return null
    }
    return experience.pricing_tiers.sort((a, b) => a.min_passengers - b.min_passengers)
  }

  const handleToggleBooking = (experienceId: string) => {
    setExpandedCard(expandedCard === experienceId ? null : experienceId)
  }

  const handleSignUpRequired = (intent: BookingIntent) => {
    setBookingIntent(intent)
    setIsSignUpModalOpen(true)
  }

  const handleSignUpSuccess = (bookingId: string) => {
    setIsSignUpModalOpen(false)
    setBookingIntent(null)
    router.push(`/book/passenger-details?booking_id=${bookingId}`)
  }

  const filteredExperiences = selectedCategory === 'all'
    ? experiences
    : experiences.filter(exp => exp.category === selectedCategory)

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileNav />

      {/* Hero Section - Minimal like screenshot */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {locale === 'es' ? 'Vive La Experiencia' : 'Live The Experience'}
          </h1>
          <p className="text-slate-500 text-sm">
            {locale === 'es'
              ? 'El cielo a hora del despegue quedará a tu elección.'
              : 'The sky at takeoff time will be your choice.'
            }
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-500">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {locale === 'es' ? 'Todas' : 'All'}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {category === 'experiences'
                    ? (locale === 'es' ? 'Experiencias' : 'Experiences')
                    : category === 'destinations'
                    ? (locale === 'es' ? 'Destinos' : 'Destinations')
                    : category
                  }
                </button>
              ))}
            </div>

            {/* Experiences Grid */}
            {filteredExperiences.length === 0 ? (
              <div className="text-center py-16">
                <Plane className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">{locale === 'es' ? 'No se encontraron experiencias.' : 'No experiences found.'}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiences.map((experience) => {
                  const pricingTiers = formatPricingTiers(experience)
                  const isExpanded = expandedCard === experience.id
                  const includes = getDisplayIncludes(experience)

                  return (
                    <div
                      key={experience.id}
                      className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'border-slate-300 shadow-lg' : 'border-slate-200 hover:shadow-md'
                      }`}
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] bg-slate-100 relative">
                        {(() => {
                          const images = experience.type === 'experience' ? experience.experience_images : experience.destination_images
                          const primaryImage = images?.find(img => img.is_primary)?.image_url
                          const firstImage = images?.[0]?.image_url
                          const displayImage = primaryImage || firstImage || experience.image_url

                          return displayImage ? (
                            <img
                              src={displayImage}
                              alt={getDisplayName(experience)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Plane className="h-12 w-12 text-slate-300" />
                            </div>
                          )
                        })()}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {getDisplayName(experience)}
                              {experience.type === 'experience' && experience.duration_minutes && (
                                <span className="text-slate-500 font-normal"> - {experience.duration_minutes} Min</span>
                              )}
                            </h3>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {getCategoryName(experience)}
                          </span>
                        </div>

                        {/* Pricing Tiers - Display like in screenshot */}
                        {pricingTiers && pricingTiers.length > 0 ? (
                          <div className="space-y-1 mb-4 text-sm">
                            {pricingTiers.map((tier, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-slate-900 font-medium">
                                  $ {tier.price.toLocaleString()} USD
                                </span>
                                <span className="text-slate-400">
                                  / {locale === 'es' ? 'Para' : 'For'} {tier.min_passengers === tier.max_passengers
                                    ? tier.min_passengers
                                    : `${tier.min_passengers}-${tier.max_passengers}`
                                  } {locale === 'es' ? 'pasajeros.' : 'passengers.'}
                                </span>
                              </div>
                            ))}
                            {experience.aircraft_options && (
                              <div className="text-xs text-slate-400 mt-1">
                                ({experience.aircraft_options})
                              </div>
                            )}
                          </div>
                        ) : experience.type === 'experience' && hasValidPrice(experience) ? (
                          <div className="mb-4">
                            <span className="text-lg font-semibold text-slate-900">
                              ${getDisplayPrice(experience).toLocaleString()}
                            </span>
                            <span className="text-slate-500 text-sm ml-1">USD</span>
                          </div>
                        ) : (
                          <div className="mb-4 text-sm text-slate-500">
                            {locale === 'es' ? 'Cotización personalizada' : 'Custom quote'}
                          </div>
                        )}

                        {/* Includes */}
                        {includes && includes.length > 0 && (
                          <ul className="space-y-1 mb-4 text-sm text-slate-600">
                            {includes.slice(0, 4).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                            {includes.length > 4 && (
                              <li className="text-slate-400 text-xs pl-6">
                                +{includes.length - 4} {locale === 'es' ? 'más' : 'more'}
                              </li>
                            )}
                          </ul>
                        )}

                        {/* Book Button */}
                        <button
                          onClick={() => handleToggleBooking(experience.id)}
                          className={`w-full py-2.5 font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                            isExpanded
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {locale === 'es' ? 'Reservar Ahora' : 'Book Now'}
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Expanded Booking Section */}
                      {isExpanded && (
                        <BookingCard
                          experience={experience}
                          locale={locale}
                          onClose={() => setExpandedCard(null)}
                          onSignUpRequired={handleSignUpRequired}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sign Up Modal */}
      <QuickSignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        bookingIntent={bookingIntent}
        onSuccess={handleSignUpSuccess}
      />
    </div>
  )
}
