'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronLeft, ChevronRight, Clock, Users, MapPin, Minus, Plus, Calendar, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/lib/auth-store'
import { getAuthHeaders } from '@/lib/auth-client'
import { format } from 'date-fns'

interface PricingTier {
  id: string
  min_passengers: number
  max_passengers: number
  price: number
}

interface ExperienceImage {
  id: string
  image_url: string
  caption: string | null
  is_primary: boolean
  order_index: number | null
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
  location: string
  image_url: string | null
  pricing_tiers?: PricingTier[]
  experience_images?: ExperienceImage[]
  destination_images?: ExperienceImage[]
  type: 'experience' | 'destination'
}

interface ExperienceBookingModalProps {
  experience: Experience
  isOpen: boolean
  onClose: () => void
  onSignUpRequired: (bookingIntent: BookingIntent) => void
}

export interface BookingIntent {
  experienceId: string
  experienceName: string
  passengerCount: number
  scheduledDate: string
  scheduledTime: string
  totalPrice: number
  type: 'experience' | 'destination'
}

export function ExperienceBookingModal({ experience, isOpen, onClose, onSignUpRequired }: ExperienceBookingModalProps) {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { profile } = useAuthStore()

  const [passengerCount, setPassengerCount] = useState(experience.min_passengers || 1)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset state when modal opens with new experience
  useEffect(() => {
    if (isOpen) {
      setPassengerCount(experience.min_passengers || 1)
      setScheduledDate('')
      setScheduledTime('09:00')
      setCurrentImageIndex(0)
      setError('')
    }
  }, [isOpen, experience.id])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const getDisplayName = () => {
    return locale === 'es' && experience.name_es ? experience.name_es : experience.name
  }

  const getDisplayDescription = () => {
    return locale === 'es' && experience.description_es ? experience.description_es : experience.description
  }

  // Get images for carousel
  const images = experience.type === 'experience'
    ? experience.experience_images || []
    : experience.destination_images || []
  const displayImages = images.length > 0 ? images : (experience.image_url ? [{ id: 'main', image_url: experience.image_url, caption: null, is_primary: true, order_index: 0 }] : [])

  // Calculate price based on pricing tiers
  const calculatePrice = (passengers: number): number => {
    if (experience.pricing_tiers && experience.pricing_tiers.length > 0) {
      // Find matching tier
      const tier = experience.pricing_tiers.find(t =>
        passengers >= t.min_passengers && passengers <= t.max_passengers
      )
      if (tier) return tier.price

      // If no exact match, find the closest tier
      const sortedTiers = [...experience.pricing_tiers].sort((a, b) => a.min_passengers - b.min_passengers)
      for (const t of sortedTiers) {
        if (passengers <= t.max_passengers) return t.price
      }
      // Return highest tier if above all
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const handleContinueBooking = async () => {
    if (!scheduledDate) {
      setError(locale === 'es' ? 'Por favor selecciona una fecha' : 'Please select a date')
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

    // If not authenticated, trigger sign-up flow
    if (!profile) {
      // Store booking intent in localStorage for after sign-up
      localStorage.setItem('booking-intent', JSON.stringify(bookingIntent))
      onSignUpRequired(bookingIntent)
      return
    }

    // If authenticated, create the booking directly
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
            per_person: pricePerPerson,
            tier_used: experience.pricing_tiers?.find(t =>
              passengerCount >= t.min_passengers && passengerCount <= t.max_passengers
            )?.id || null
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      // Store booking ID for confirmation page
      sessionStorage.setItem('lastBookingId', data.booking.id)
      sessionStorage.setItem('lastBooking', JSON.stringify({
        ...data.booking,
        experienceName: getDisplayName()
      }))

      onClose()
      router.push(`/book/passenger-details?booking_id=${data.booking.id}`)
    } catch (err: any) {
      setError(err.message || (locale === 'es' ? 'Error al crear la reserva' : 'Failed to create booking'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  // Time options
  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-luxury-charcoal rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image Carousel */}
        {displayImages.length > 0 && (
          <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
            <img
              src={displayImages[currentImageIndex]?.image_url}
              alt={getDisplayName()}
              className="w-full h-full object-cover"
            />
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {displayImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {/* Title and Description */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {getDisplayName()}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {getDisplayDescription()}
          </p>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 mb-5 text-sm text-gray-600 dark:text-gray-400">
            {experience.type === 'experience' && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                  {experience.duration_minutes
                    ? `${experience.duration_minutes} ${t('common.minutes')}`
                    : `${experience.duration_hours} ${t('common.hours')}`
                  }
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{experience.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{experience.min_passengers}-{experience.max_passengers} {t('common.passengers')}</span>
            </div>
          </div>

          {/* Passenger Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('booking.form.passengers')}
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePassengerChange(-1)}
                disabled={passengerCount <= experience.min_passengers}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-2xl font-bold text-gray-900 dark:text-white min-w-[3rem] text-center">
                {passengerCount}
              </span>
              <button
                onClick={() => handlePassengerChange(1)}
                disabled={passengerCount >= experience.max_passengers}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg p-4 mb-5 text-center">
            <div className="text-3xl font-bold text-gray-900">
              ${totalPrice.toLocaleString()} <span className="text-lg font-normal">USD</span>
            </div>
            <div className="text-sm text-gray-800">
              (${pricePerPerson} {locale === 'es' ? 'por persona' : 'per person'})
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('booking.form.date')}
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={today}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('booking.form.time')}
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleContinueBooking}
              disabled={isSubmitting}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (locale === 'es' ? 'Procesando...' : 'Processing...')
                : (locale === 'es' ? 'Continuar Reserva' : 'Continue Booking')
              }
            </button>
            <a
              href={experience.type === 'destination' ? `/book/destinations/${experience.id}` : `/book/experiences/${experience.id}`}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {locale === 'es' ? 'Ver Todos los Detalles' : 'View Full Details'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
