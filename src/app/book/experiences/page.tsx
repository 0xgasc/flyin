'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Calendar, Users, Clock, MapPin, CheckCircle, ArrowLeft, Plane } from 'lucide-react'
import { format } from 'date-fns'

const LOGO_URL = 'https://isteam.wsimg.com/ip/5d044532-96be-44dc-9d52-5a4c26b5b2e3/Logo_FlyInGuatemala_c03.png'

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
  const { profile } = useAuthStore()
  const { t, locale } = useTranslation()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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

  const filteredExperiences = selectedCategory === 'all' 
    ? experiences 
    : experiences.filter(exp => exp.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src={LOGO_URL}
              alt="FlyInGuate"
              width={150}
              height={50}
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            {profile ? (
              <Link href="/dashboard" className="hover:opacity-80">
                {t('nav.dashboard')}
              </Link>
            ) : (
              <Link href="/login" className="hover:opacity-80">
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {locale === 'es' ? 'Experiencias y Destinos' : 'Experiences & Destinations'}
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            {locale === 'es' 
              ? 'Descubre Guatemala desde las alturas con nuestros tours en helicóptero y servicios de transporte premium.'
              : 'Discover Guatemala from above with our helicopter tours and premium transport services.'
            }
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {locale === 'es' ? 'Todas' : 'All'}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">{locale === 'es' ? 'No se encontraron experiencias.' : 'No experiences found.'}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiences.map((experience) => (
                <div key={experience.id} className="card-luxury hover:scale-105 transition-transform">
                  <div className="aspect-video bg-gray-200 rounded mb-4 relative overflow-hidden">
                    {(() => {
                      // Get primary image from experience_images or destination_images
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
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-100 to-primary-200">
                          <Plane className="h-12 w-12 text-primary-600" />
                        </div>
                      )
                    })()}
                    <div className="absolute top-2 right-2">
                      <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {getCategoryName(experience)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{getDisplayName(experience)}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">{getDisplayDescription(experience)}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {experience.location}
                    </div>
                    {experience.type === 'experience' && (
                      <>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {experience.duration_minutes ? `${experience.duration_minutes} ${t('common.minutes')}` : `${experience.duration_hours} ${t('common.hours')}`}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {experience.min_passengers === experience.max_passengers 
                            ? `${experience.max_passengers} ${t('common.passengers')}`
                            : `${experience.min_passengers}-${experience.max_passengers} ${t('common.passengers')}`
                          }
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {experience.type === 'experience' ? (
                        <>
                          <span className="text-2xl font-bold text-primary-900">
                            ${experience.base_price}
                          </span>
                          <span className="text-sm text-gray-600 ml-1">USD</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-600 font-medium">
                          {locale === 'es' ? 'Cotización personalizada' : 'Custom Quote'}
                        </span>
                      )}
                    </div>
                    <Link
                      href={experience.type === 'destination' ? `/book/destinations/${experience.id}` : `/book/experiences/${experience.id}`}
                      className="btn-primary text-sm inline-block text-center"
                    >
                      {locale === 'es' ? 'Ver Detalles' : 'View Details'}
                    </Link>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}