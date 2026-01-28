'use client'

import { useState } from 'react'
import { X, User, Mail, Phone } from 'lucide-react'

interface GuestBookingModalProps {
  show: boolean
  onClose: () => void
  onSubmit: (guestData: GuestData) => void
  bookingData: any
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

  if (!show) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(guestData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none shadow-xl p-6 max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Book as Guest
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Provide your contact details to complete the booking. We'll call you to confirm.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={guestData.full_name}
                onChange={(e) => setGuestData({ ...guestData, full_name: e.target.value })}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                value={guestData.email}
                onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="tel"
                value={guestData.phone}
                onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-gold-500"
                placeholder="+502 5555 5555"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
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
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-luxury"
            >
              Submit Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}