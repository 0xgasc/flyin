'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { useToast } from '@/lib/toast-store'
import { MobileNav } from '@/components/mobile-nav'
import {
  ArrowLeft, Clock, Users, MapPin, CheckCircle,
  Calendar, DollarSign, Star, Camera,
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'

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
  highlights?: string[]
  requirements?: string[]
  meeting_point?: string
  location: string
  aircraft_options: any
  route_waypoints: string[]
  category: string
  image_url: string | null
  category_name_en: string | null
  category_name_es: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ExperienceImage {
  id: string
  image_url: string
  caption: string | null
  is_primary: boolean
  order_index: number
}

export default function ExperienceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { profile } = useAuthStore()
  const { t, locale } = useTranslation()
  const toast = useToast()
  
  const [experience, setExperience] = useState<Experience | null>(null)
  const [images, setImages] = useState<ExperienceImage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    passengers: 2,
    notes: '',
    aircraftOption: 0,
  })

  useEffect(() => {
    if (params.id) {
      fetchExperience()
      fetchImages()
    }
  }, [params.id])

  const fetchExperience = async () => {
    try {
      const response = await fetch(`/api/experiences/${params.id}`)
      const data = await response.json()

      if (data.success && data.experience) {
        setExperience({
          id: data.experience.id,
          name: data.experience.name,
          name_es: data.experience.name_es,
          description: data.experience.description,
          description_es: data.experience.description_es,
          duration_hours: data.experience.duration_hours,
          duration_minutes: data.experience.duration_minutes,
          base_price: data.experience.base_price,
          max_passengers: data.experience.max_passengers,
          min_passengers: data.experience.min_passengers || 1,
          includes: data.experience.includes || [],
          includes_es: data.experience.includes_es,
          highlights: data.experience.highlights,
          requirements: data.experience.requirements,
          meeting_point: data.experience.meeting_point,
          location: data.experience.location,
          aircraft_options: data.experience.aircraft_options,
          route_waypoints: data.experience.route_waypoints || [],
          category: data.experience.category,
          image_url: data.experience.image_url,
          category_name_en: data.experience.category_name_en,
          category_name_es: data.experience.category_name_es,
          is_active: data.experience.is_active,
          created_at: data.experience.created_at,
          updated_at: data.experience.updated_at
        })
        // Also set images if returned
        if (data.experience_images) {
          setImages(data.experience_images)
        }
      }
    } catch (error) {
      console.error('Error fetching experience:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImages = async () => {
    // Images are now fetched together with experience
    // This function is kept for compatibility but may not be needed
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) {
      toast.warning('Please login to book an experience')
      router.push('/login?redirect=' + encodeURIComponent(`/book/experiences/${params.id}`))
      return
    }

    // Validate date is not in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(formData.date)
    if (selectedDate < today) {
      toast.error(locale === 'es' ? 'La fecha no puede ser en el pasado' : 'Date cannot be in the past')
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_type: 'experience',
          experience_id: params.id,
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          passenger_count: formData.passengers,
          total_price: experience?.base_price || 0,
          notes: formData.notes
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create booking')
      }

      toast.success(locale === 'es' ? '¡Reserva exitosa! Redirigiendo...' : 'Booking successful! Redirecting...')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error('Error creating booking: ' + error.message)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Experience Not Found</h1>
          <Link
            href="/book/experiences"
            className="text-primary-600 hover:text-primary-800 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Experiences
          </Link>
        </div>
      </div>
    )
  }

  const displayName = locale === 'es' && experience.name_es ? experience.name_es : experience.name
  const displayDescription = locale === 'es' && experience.description_es ? experience.description_es : experience.description
  const displayIncludes = locale === 'es' && experience.includes_es ? experience.includes_es : experience.includes

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/book/experiences"
          className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Experiences
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <div className="relative">
                <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                  <img
                    src={images[currentImageIndex]?.image_url}
                    alt={images[currentImageIndex]?.caption || displayName}
                    className="w-full h-64 sm:h-80 md:h-96 object-cover object-center"
                  />
                </div>
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            ) : experience.image_url ? (
              <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                <img
                  src={experience.image_url}
                  alt={displayName}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover object-center"
                />
              </div>
            ) : (
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-14 sm:h-16 rounded overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary-600' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Experience Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{displayName}</h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {experience.location}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {experience.duration_hours}h {experience.duration_minutes}m
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{displayDescription}</p>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded shadow-sm">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-primary-600 dark:text-gold-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${experience.base_price}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">From</div>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 text-primary-600 dark:text-gold-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{experience.min_passengers}-{experience.max_passengers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Passengers</div>
              </div>
            </div>

            {/* What's Included */}
            {displayIncludes && displayIncludes.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">What's Included</h3>
                <div className="space-y-2">
                  {displayIncludes.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Waypoints */}
            {experience.route_waypoints && experience.route_waypoints.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Route Highlights</h3>
                <div className="space-y-2">
                  {experience.route_waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{waypoint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {experience.requirements && experience.requirements.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
                <div className="space-y-2">
                  {experience.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Point */}
            {experience.meeting_point && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Meeting Point</h3>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{experience.meeting_point}</p>
                </div>
              </div>
            )}

            {/* Book Now Button */}
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-primary-600 text-white py-4 px-6 rounded hover:bg-primary-700 transition-colors font-medium text-lg"
            >
              Book This Experience
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book {displayName}</h2>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('booking.form.date')}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('booking.form.time')}
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('booking.form.passengers')}
                </label>
                <select
                  value={formData.passengers}
                  onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {(() => {
                    const minPass = experience?.min_passengers || 1;
                    const maxPass = experience?.max_passengers || 8;
                    const passengers = [];
                    for (let i = minPass; i <= maxPass; i++) {
                      passengers.push(
                        <option key={i} value={i}>
                          {i} {i === 1 ? 'passenger' : 'passengers'}
                        </option>
                      );
                    }
                    return passengers;
                  })()}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('booking.form.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('booking.form.notesPlaceholder')}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}