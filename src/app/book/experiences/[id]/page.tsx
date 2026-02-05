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
  Plane, ChevronLeft, ChevronRight, AlertTriangle
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
  const { locale } = useTranslation()
  const toast = useToast()

  const [experience, setExperience] = useState<Experience | null>(null)
  const [images, setImages] = useState<ExperienceImage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [formData, setFormData] = useState({
    date: '',
    time: '09:00',
    passengers: 2,
    notes: '',
  })

  useEffect(() => {
    if (params.id) {
      fetchExperience()
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) {
      toast.warning(locale === 'es' ? 'Por favor inicia sesión para reservar' : 'Please login to book')
      router.push('/login?redirect=' + encodeURIComponent(`/book/experiences/${params.id}`))
      return
    }

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

      toast.success(locale === 'es' ? '¡Reserva exitosa!' : 'Booking successful!')
      router.push(`/book/passenger-details?booking_id=${data.booking.id}`)
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error(error.message)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">{locale === 'es' ? 'Cargando...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            {locale === 'es' ? 'Experiencia no encontrada' : 'Experience Not Found'}
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {locale === 'es' ? 'Esta experiencia no existe o ha sido removida.' : 'This experience does not exist or has been removed.'}
          </p>
          <Link href="/book/experiences" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {locale === 'es' ? 'Ver Experiencias' : 'View Experiences'}
          </Link>
        </div>
      </div>
    )
  }

  const displayName = locale === 'es' && experience.name_es ? experience.name_es : experience.name
  const displayDescription = locale === 'es' && experience.description_es ? experience.description_es : experience.description
  const displayIncludes = locale === 'es' && experience.includes_es ? experience.includes_es : experience.includes

  const heroImage = images[currentImageIndex]?.image_url || experience.image_url

  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  const durationMinutes = experience.duration_minutes || experience.duration_hours * 60

  return (
    <div className="min-h-screen bg-white">
      <MobileNav />

      {/* Hero Image */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] bg-slate-100">
        {heroImage ? (
          <img
            src={heroImage}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Plane className="w-16 h-16 text-slate-300" />
          </div>
        )}

        {/* Back button */}
        <Link
          href="/book/experiences"
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg text-slate-700 hover:bg-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === 'es' ? 'Volver' : 'Back'}
        </Link>

        {/* Image navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <MapPin className="w-4 h-4" />
                {experience.location}
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">
                {displayName}
              </h1>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{durationMinutes} {locale === 'es' ? 'minutos' : 'minutes'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{experience.min_passengers}-{experience.max_passengers} {locale === 'es' ? 'pasajeros' : 'passengers'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-medium text-slate-900 mb-3">
                {locale === 'es' ? 'Descripción' : 'Description'}
              </h2>
              <p className="text-slate-600 leading-relaxed">{displayDescription}</p>
            </div>

            {/* What's Included */}
            {displayIncludes && displayIncludes.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-slate-900 mb-3">
                  {locale === 'es' ? 'Qué Incluye' : "What's Included"}
                </h2>
                <div className="space-y-2">
                  {displayIncludes.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Waypoints */}
            {experience.route_waypoints && experience.route_waypoints.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-slate-900 mb-3">
                  {locale === 'es' ? 'Puntos de la Ruta' : 'Route Highlights'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {experience.route_waypoints.map((waypoint, index) => (
                    <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
                      {waypoint}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {experience.requirements && experience.requirements.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-slate-900 mb-3">
                  {locale === 'es' ? 'Requisitos' : 'Requirements'}
                </h2>
                <div className="space-y-2">
                  {experience.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Point */}
            {experience.meeting_point && (
              <div>
                <h2 className="text-lg font-medium text-slate-900 mb-3">
                  {locale === 'es' ? 'Punto de Encuentro' : 'Meeting Point'}
                </h2>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">{experience.meeting_point}</span>
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-sm text-slate-500 mb-1">{locale === 'es' ? 'Desde' : 'From'}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-slate-900">${experience.base_price}</span>
                  <span className="text-slate-500">USD</span>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {locale === 'es' ? 'Fecha' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {locale === 'es' ? 'Hora' : 'Time'}
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {locale === 'es' ? 'Pasajeros' : 'Passengers'}
                  </label>
                  <select
                    value={formData.passengers}
                    onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    {Array.from(
                      { length: experience.max_passengers - experience.min_passengers + 1 },
                      (_, i) => experience.min_passengers + i
                    ).map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? (locale === 'es' ? 'pasajero' : 'passenger') : (locale === 'es' ? 'pasajeros' : 'passengers')}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                >
                  {locale === 'es' ? 'Reservar' : 'Book Now'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-4">
                {locale === 'es' ? 'No se cobra hasta la confirmación' : 'No charge until confirmation'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="border-t border-slate-100 py-4">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${
                    index === currentImageIndex ? 'ring-2 ring-slate-900' : 'opacity-60 hover:opacity-100'
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
          </div>
        </div>
      )}
    </div>
  )
}
