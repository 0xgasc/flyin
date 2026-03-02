'use client'

import { useState, useEffect, useRef } from 'react'
import { X, User, Mail, Phone } from 'lucide-react'

interface BookingData {
  from_location?: string
  to_location?: string
  experience_name?: string
  date?: string
  time?: string
}

interface GuestBookingModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (guestData: GuestData) => void
  bookingData: BookingData
}

interface GuestData {
  full_name: string
  email: string
  phone: string
  notes?: string
}

export default function GuestBookingModal({ show, onClose, onSubmit, bookingData }: GuestBookingModalProps) {
  const [guestData, setGuestData] = useState<GuestData>({
    full_name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof GuestData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus trap: Focus the modal when it opens
  useEffect(() => {
    if (show && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [show])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [show, onClose])

  if (!show) return null

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GuestData, string>> = {}

    if (!guestData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!guestData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!guestData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(guestData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="guest-modal-title" aria-describedby="guest-modal-description">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} aria-hidden="true" />
      <div ref={modalRef} className="relative bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none shadow-xl p-6 max-w-md w-full mx-4">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close booking modal"
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 id="guest-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Book as Guest
        </h3>

        <p id="guest-modal-description" className="text-gray-600 dark:text-gray-400 mb-6">
          Provide your contact details to complete the booking. We'll call you to confirm.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                id="guest-name"
                type="text"
                value={guestData.full_name}
                onChange={(e) => {
                  setGuestData({ ...guestData, full_name: e.target.value })
                  if (errors.full_name) setErrors({ ...errors, full_name: undefined })
                }}
                aria-required="true"
                aria-invalid={!!errors.full_name}
                aria-describedby={errors.full_name ? 'name-error' : undefined}
                className={`w-full pl-10 pr-3 py-3 border ${errors.full_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500`}
                placeholder="John Doe"
                required
              />
            </div>
            {errors.full_name && (
              <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.full_name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                id="guest-email"
                type="email"
                value={guestData.email}
                onChange={(e) => {
                  setGuestData({ ...guestData, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500`}
                placeholder="john@example.com"
                required
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="guest-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                id="guest-phone"
                type="tel"
                value={guestData.phone}
                onChange={(e) => {
                  setGuestData({ ...guestData, phone: e.target.value })
                  if (errors.phone) setErrors({ ...errors, phone: undefined })
                }}
                aria-required="true"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={`w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500`}
                placeholder="+502 5555 5555"
                required
              />
            </div>
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="guest-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              id="guest-notes"
              value={guestData.notes}
              onChange={(e) => setGuestData({ ...guestData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500"
              placeholder="Any special requests or preferences..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="flex-1 btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}