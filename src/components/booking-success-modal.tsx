'use client'

import { CheckCircle, X } from 'lucide-react'
import { useEffect } from 'react'

interface BookingSuccessModalProps {
  show: boolean
  onClose: () => void
  message?: string
}

export default function BookingSuccessModal({ show, onClose, message }: BookingSuccessModalProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Booking Successful!
          </h3>
          
          <p className="text-gray-600 mb-4">
            {message || 'Your booking has been confirmed. Redirecting to your dashboard...'}
          </p>
          
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting...
          </div>
        </div>
      </div>
    </div>
  )
}