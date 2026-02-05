'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useTranslation } from '@/lib/i18n'
import { MobileNav } from '@/components/mobile-nav'
import { ExperienceBookingModal, BookingIntent } from '@/components/experience-booking-modal'
import { QuickSignUpModal } from '@/components/quick-signup-modal'
import { Users, Clock, MapPin, Plane, ArrowRight, Sparkles } from 'lucide-react'


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

export default function BookExperiencesPage() {
  const router = useRouter()

  const { t, locale } = useTranslation()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Modal state
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [bookingIntent, setBookingIntent] = useState<BookingIntent | null>(null)

  useEffect(() => {
    // Add timeout to prevent infinite spinning
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
    console.log('🔄 fetchExperiences started')
    setLoading(true)

    try {
      // Fetch both experiences and destinations from MongoDB API
      console.log('📡 Querying experiences and destinations...')
      const [experiencesResponse, destinationsResponse] = await Promise.all([
        fetch('/api/experiences'),
        fetch('/api/destinations?include_images=true')
      ])

      const experiencesData = await experiencesResponse.json()
      const destinationsData = await destinationsResponse.json()

      console.log('📊 Query results:', {
        experiencesCount: experiencesData.experiences?.length || 0,
        destinationsCount: destinationsData.destinations?.length || 0
      })

      const allItems = []
      const allCategories = new Set(['experiences', 'destinations'])

      // Process experiences
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
        console.log('✅ Added', experienceItems.length, 'experiences')
      }

      // Process destinations
      if (destinationsData.success && destinationsData.destinations?.length > 0) {
        const destinationItems = destinationsData.destinations.map((dest: any) => ({
          id: dest.id,
          name: dest.name,
          name_es: null,
          description: dest.description,
          description_es: null,
          duration_hours: 0,
          duration_minutes: null,
          base_price: 0, // Destinations have custom pricing
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
        console.log('✅ Added', destinationItems.length, 'destinations')
      }

      // Sort all items by order_index to maintain proper ordering across both types
      const sortedItems = allItems.sort((a, b) => {
        const aOrder = a.order_index ?? 999
        const bOrder = b.order_index ?? 999
        return aOrder - bOrder
      })

      setExperiences(sortedItems)
      setCategories(Array.from(allCategories))
      console.log('✅ Total items loaded:', sortedItems.length)

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

  const getDisplayDescription = (experience: Experience) => {
    return locale === 'es' && experience.description_es ? experience.description_es : experience.description
  }

  const getCategoryName = (experience: Experience) => {
    if (experience.type === 'destination') {
      return locale === 'es' ? 'Destino' : 'Destination'
    }
    return locale === 'es' ? 'Experiencia' : 'Experience'
  }

  // Get display price - use lowest tier price if available, otherwise base_price
  const getDisplayPrice = (experience: Experience): number => {
    if (experience.pricing_tiers && experience.pricing_tiers.length > 0) {
      // Get the lowest price from tiers
      const lowestTier = experience.pricing_tiers.reduce((min, tier) =>
        tier.price < min.price ? tier : min
      , experience.pricing_tiers[0])
      return lowestTier.price
    }
    return experience.base_price
  }

  // Check if experience has valid pricing
  const hasValidPrice = (experience: Experience): boolean => {
    if (experience.pricing_tiers && experience.pricing_tiers.length > 0) {
      return experience.pricing_tiers.some(t => t.price > 0)
    }
    return experience.base_price > 0
  }

  // Modal handlers
  const handleOpenBookingModal = (experience: Experience) => {
    setSelectedExperience(experience)
    setIsBookingModalOpen(true)
  }

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false)
    setSelectedExperience(null)
  }

  const handleSignUpRequired = (intent: BookingIntent) => {
    setBookingIntent(intent)
    setIsBookingModalOpen(false)
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
    <div className="min-h-screen bg-white">
      <MobileNav />

      {/* Hero Section - Clean and minimal */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-gold-400" />
              <span className="text-gold-400 font-medium text-sm uppercase tracking-wider">
                {locale === 'es' ? 'Experiencias Premium' : 'Premium Experiences'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'es' ? 'Vuela Sobre Guatemala' : 'Fly Over Guatemala'}
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              {locale === 'es'
                ? 'Tours en helicóptero y transporte aéreo privado. Descubre vistas que pocos han visto.'
                : 'Helicopter tours and private air transport. Discover views that few have seen.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-primary-600 mx-auto mb-4"></div>
              <p className="text-slate-500">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Category Filter - Pill style */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {locale === 'es' ? 'Todas' : 'All'}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                <p className="text-slate-500 text-lg">{locale === 'es' ? 'No se encontraron experiencias.' : 'No experiences found.'}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredExperiences.map((experience) => (
                <div
                  key={experience.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {(() => {
                      const images = experience.type === 'experience' ? experience.experience_images : experience.destination_images
                      const primaryImage = images?.find(img => img.is_primary)?.image_url
                      const firstImage = images?.[0]?.image_url
                      const displayImage = primaryImage || firstImage || experience.image_url

                      return displayImage ? (
                        <img
                          src={displayImage}
                          alt={getDisplayName(experience)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-100 to-slate-200">
                          <Plane className="h-16 w-16 text-slate-300" />
                        </div>
                      )
                    })()}
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                        {getCategoryName(experience)}
                      </span>
                    </div>
                    {/* Price Badge */}
                    {experience.type === 'experience' && hasValidPrice(experience) && (
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-slate-900/90 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full">
                          ${getDisplayPrice(experience).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {getDisplayName(experience)}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                      {getDisplayDescription(experience)}
                    </p>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-3 mb-5">
                      <div className="flex items-center text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {experience.location}
                      </div>
                      {experience.type === 'experience' && (
                        <>
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {experience.duration_minutes ? `${experience.duration_minutes} min` : `${experience.duration_hours}h`}
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            {experience.min_passengers}-{experience.max_passengers}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenBookingModal(experience)}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                      >
                        {locale === 'es' ? 'Reservar Ahora' : 'Book Now'}
                      </button>
                      <Link
                        href={experience.type === 'destination' ? `/book/destinations/${experience.id}` : `/book/experiences/${experience.id}`}
                        className="flex items-center justify-center px-4 py-2.5 border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedExperience && (
        <ExperienceBookingModal
          experience={selectedExperience}
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          onSignUpRequired={handleSignUpRequired}
        />
      )}

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
