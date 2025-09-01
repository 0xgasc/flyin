'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { 
  ArrowLeft, Clock, Users, MapPin, CheckCircle, 
  Calendar, DollarSign, Plane, Star, Camera,
  ChevronLeft, ChevronRight
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
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      if (data) setExperience(data)
    } catch (error) {
      console.error('Error fetching experience:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('experience_images')
        .select('*')
        .eq('experience_id', params.id)
        .order('order_index')

      if (error) throw error
      if (data) setImages(data)
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile) {
      alert('Please login to book an experience')
      router.push('/login?redirect=' + encodeURIComponent(`/book/experiences/${params.id}`))
      return
    }

    try {
      const { error } = await supabase.from('bookings').insert({
        client_id: profile.id,
        booking_type: 'experience',
        experience_id: params.id,
        scheduled_date: formData.date,
        scheduled_time: formData.time,
        passenger_count: formData.passengers,
        total_price: experience?.base_price || 0,
        notes: formData.notes,
        status: 'pending',
        payment_status: 'pending'
      })

      if (error) throw error

      alert(locale === 'es' ? '¡Reserva exitosa! Redirigiendo a su panel...' : 'Booking successful! Redirecting to your dashboard...')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating booking:', error)
      alert('Error creating booking: ' + error.message)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Experience Not Found</h1>
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Plane className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate</span>
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
                <div className="aspect-w-16 aspect-h-10 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={images[currentImageIndex]?.image_url}
                    alt={images[currentImageIndex]?.caption || displayName}
                    className="w-full h-96 object-cover"
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
              <div className="aspect-w-16 aspect-h-10 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={experience.image_url}
                  alt={displayName}
                  className="w-full h-96 object-cover"
                />
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-10 bg-gray-200 rounded-lg flex items-center justify-center">
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
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
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
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">${experience.base_price}</div>
                <div className="text-sm text-gray-600">From</div>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">{experience.min_passengers}-{experience.max_passengers}</div>
                <div className="text-sm text-gray-600">Passengers</div>
              </div>
            </div>

            {/* What's Included */}
            {displayIncludes && displayIncludes.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">What's Included</h3>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Route Highlights</h3>
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

            {/* Book Now Button */}
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg"
            >
              Book This Experience
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book {displayName}</h2>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.form.date')}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.form.time')}
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.form.passengers')}
                </label>
                <select
                  value={formData.passengers}
                  onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Array.from({length: experience.max_passengers - experience.min_passengers + 1}, (_, i) => (
                    <option key={i} value={experience.min_passengers + i}>
                      {experience.min_passengers + i} {experience.min_passengers + i === 1 ? 'passenger' : 'passengers'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.form.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('booking.form.notesPlaceholder')}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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