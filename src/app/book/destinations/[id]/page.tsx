'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { useTranslation } from '@/lib/i18n'
import { useToast } from '@/lib/toast-store'
import { MobileNav } from '@/components/mobile-nav'
import {
  ArrowLeft, MapPin, CheckCircle,
  DollarSign, Star, Camera,
  ChevronLeft, ChevronRight, Navigation, AlertTriangle, Clock
} from 'lucide-react'

interface Destination {
  id: string
  name: string
  description: string
  location: string
  coordinates: { lat: number; lng: number }
  features: string[]
  highlights?: string[]
  requirements?: string[]
  meeting_point?: string
  best_time?: string
  difficulty_level?: string
  is_active: boolean
  metadata: any
  created_at: string
  updated_at: string
}

interface DestinationImage {
  id: string
  image_url: string
  caption: string | null
  is_primary: boolean
  order_index: number
}

export default function DestinationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { profile } = useAuthStore()
  const { locale } = useTranslation()
  const toast = useToast()
  
  const [destination, setDestination] = useState<Destination | null>(null)
  const [images, setImages] = useState<DestinationImage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    passengers: 2,
    notes: '',
    fromLocation: '',
    returnDate: '',
    returnTime: '',
    isRoundTrip: false
  })

  useEffect(() => {
    if (params.id) {
      fetchDestination()
      fetchImages()
    }
  }, [params.id])

  const fetchDestination = async () => {
    try {
      const response = await fetch(`/api/destinations/${params.id}`)
      const data = await response.json()

      if (data.success && data.destination) {
        setDestination({
          id: data.destination.id,
          name: data.destination.name,
          description: data.destination.description,
          location: data.destination.location,
          coordinates: data.destination.coordinates,
          features: data.destination.features || [],
          highlights: data.destination.highlights,
          requirements: data.destination.requirements,
          meeting_point: data.destination.meeting_point,
          best_time: data.destination.best_time,
          difficulty_level: data.destination.difficulty_level,
          is_active: data.destination.is_active,
          metadata: data.destination.metadata,
          created_at: data.destination.created_at,
          updated_at: data.destination.updated_at
        })
        // Also set images if returned
        if (data.destination_images) {
          setImages(data.destination_images)
        }
      }
    } catch (error) {
      console.error('Error fetching destination:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImages = async () => {
    // Images are now fetched together with destination
    // This function is kept for compatibility but may not be needed
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) {
      toast.warning('Please login to book transport to this destination')
      router.push('/login?redirect=' + encodeURIComponent(`/book/destinations/${params.id}`))
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_type: 'transport',
          destination_id: params.id,
          from_location: formData.fromLocation,
          to_location: destination?.location || '',
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          return_date: formData.isRoundTrip ? formData.returnDate : null,
          return_time: formData.isRoundTrip ? formData.returnTime : null,
          is_round_trip: formData.isRoundTrip,
          passenger_count: formData.passengers,
          total_price: 0, // Will be calculated by admin
          notes: formData.notes
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create booking')
      }

      toast.success(locale === 'es' ? '¡Solicitud enviada! Te contactaremos pronto.' : 'Request submitted! We will contact you soon.')
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

  const openGoogleMaps = () => {
    if (destination?.coordinates) {
      const url = `https://www.google.com/maps?q=${destination.coordinates.lat},${destination.coordinates.lng}`
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Destination Not Found</h1>
          <Link
            href="/book/experiences"
            className="text-primary-600 hover:text-primary-800 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Destinations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      {/* Navigation */}
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/book/experiences"
          className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Destinations
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <div className="relative">
                <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                  <img
                    src={images[currentImageIndex]?.image_url}
                    alt={images[currentImageIndex]?.caption || destination.name}
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

          {/* Destination Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{destination.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {destination.location}
                </div>
                {destination.coordinates && (
                  <button
                    onClick={openGoogleMaps}
                    className="flex items-center text-primary-600 hover:text-primary-800"
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    View on Map
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{destination.description}</p>

            {/* Key Details */}
            <div className="p-4 bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded shadow-sm">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-primary-600 dark:text-gold-400 mx-auto mb-1" />
                <div className="text-lg font-medium text-gray-900 dark:text-white">Custom Quote</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Price varies by distance and group size</div>
              </div>
            </div>

            {/* Destination Features */}
            {destination.features && destination.features.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Destination Features</h3>
                <div className="space-y-2">
                  {destination.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {destination.highlights && destination.highlights.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Highlights</h3>
                <div className="space-y-2">
                  {destination.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {destination.requirements && destination.requirements.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
                <div className="space-y-2">
                  {destination.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Point */}
            {destination.meeting_point && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Meeting Point</h3>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{destination.meeting_point}</p>
                </div>
              </div>
            )}

            {/* Best Time */}
            {destination.best_time && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Best Time to Visit</h3>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{destination.best_time}</p>
                </div>
              </div>
            )}

            {/* Difficulty Level */}
            {destination.difficulty_level && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Difficulty Level</h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {destination.difficulty_level.charAt(0).toUpperCase() + destination.difficulty_level.slice(1)}
                </div>
              </div>
            )}

            {/* Coordinates Info */}
            {destination.coordinates && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Location</h3>
                <div className="p-3 bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded shadow-sm">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Coordinates: {destination.coordinates.lat.toFixed(6)}, {destination.coordinates.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            )}

            {/* Request Transport Button */}
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-primary-600 text-white py-4 px-6 rounded hover:bg-primary-700 transition-colors font-medium text-lg"
            >
              Request Transport to {destination.name}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Request Transport</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Transport to {destination.name}</p>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Location
                </label>
                <input
                  type="text"
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Guatemala City, Hotel name, address..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Departure Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="roundTrip"
                  checked={formData.isRoundTrip}
                  onChange={(e) => setFormData({...formData, isRoundTrip: e.target.checked})}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="roundTrip" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Round trip (return flight)
                </label>
              </div>

              {formData.isRoundTrip && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required={formData.isRoundTrip}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Return Time
                    </label>
                    <input
                      type="time"
                      value={formData.returnTime}
                      onChange={(e) => setFormData({...formData, returnTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required={formData.isRoundTrip}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Passengers
                </label>
                <select
                  value={formData.passengers}
                  onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Array.from({length: 8}, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'passenger' : 'passengers'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Special Requests or Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any special requirements, luggage details, etc..."
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}