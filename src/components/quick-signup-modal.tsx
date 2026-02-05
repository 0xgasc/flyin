'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/lib/auth-store'
import { register, login, getAuthHeaders } from '@/lib/auth-client'
import { BookingIntent } from './experience-booking-modal'

interface QuickSignUpModalProps {
  isOpen: boolean
  onClose: () => void
  bookingIntent: BookingIntent | null
  onSuccess: (bookingId: string) => void
}

export function QuickSignUpModal({ isOpen, onClose, bookingIntent, onSuccess }: QuickSignUpModalProps) {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const { setUser, setProfile } = useAuthStore()

  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('')
    }
  }, [isOpen])

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

  const createBookingWithAuth = async () => {
    if (!bookingIntent) return null

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          booking_type: 'experience',
          experience_id: bookingIntent.experienceId,
          scheduled_date: bookingIntent.scheduledDate,
          scheduled_time: bookingIntent.scheduledTime,
          passenger_count: bookingIntent.passengerCount,
          total_price: bookingIntent.totalPrice,
          price_breakdown: {
            base_price: bookingIntent.totalPrice,
            passengers: bookingIntent.passengerCount,
            per_person: Math.round(bookingIntent.totalPrice / bookingIntent.passengerCount)
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      // Store booking info for confirmation
      sessionStorage.setItem('lastBookingId', data.booking.id)
      sessionStorage.setItem('lastBooking', JSON.stringify({
        ...data.booking,
        experienceName: bookingIntent.experienceName
      }))

      return data.booking.id
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create booking')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      let result
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error(locale === 'es' ? 'Por favor ingresa tu nombre' : 'Please enter your name')
        }
        result = await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          role: 'client'
        })
      } else {
        result = await login(email.trim(), password)
      }

      if (!result.success) {
        throw new Error(result.error || (locale === 'es' ? 'Error de autenticación' : 'Authentication failed'))
      }

      // Update auth store
      if (result.user) {
        setUser(result.user)
        setProfile(result.user)
      }

      // Create the booking with the new/logged in user
      const bookingId = await createBookingWithAuth()

      // Clear stored booking intent
      localStorage.removeItem('booking-intent')

      if (bookingId) {
        onSuccess(bookingId)
      }
    } catch (err: any) {
      setError(err.message || (locale === 'es' ? 'Ocurrió un error' : 'An error occurred'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-luxury-charcoal rounded-lg shadow-2xl w-full max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {mode === 'signup'
              ? (locale === 'es' ? 'Crear Cuenta para Continuar' : 'Create Account to Continue')
              : (locale === 'es' ? 'Iniciar Sesión para Continuar' : 'Sign In to Continue')
            }
          </h2>
          {bookingIntent && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {locale === 'es'
                ? `Reservando: ${bookingIntent.experienceName}`
                : `Booking: ${bookingIntent.experienceName}`
              }
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.full_name')} *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder={locale === 'es' ? 'Tu nombre completo' : 'Your full name'}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.email')} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={locale === 'es' ? 'tu@email.com' : 'you@email.com'}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.password')} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={locale === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Phone (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+502 5555-5555"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? (locale === 'es' ? 'Procesando...' : 'Processing...')
              : mode === 'signup'
                ? (locale === 'es' ? 'Crear Cuenta y Continuar' : 'Create Account & Continue')
                : (locale === 'es' ? 'Iniciar Sesión y Continuar' : 'Sign In & Continue')
            }
          </button>

          {/* Toggle Mode */}
          <div className="mt-4 text-center text-sm">
            {mode === 'signup' ? (
              <p className="text-gray-600 dark:text-gray-400">
                {locale === 'es' ? '¿Ya tienes cuenta? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError('') }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {locale === 'es' ? 'Inicia Sesión' : 'Sign In'}
                </button>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {locale === 'es' ? '¿No tienes cuenta? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {locale === 'es' ? 'Crear Cuenta' : 'Sign Up'}
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
