'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, MapPin, Plane, Mountain } from 'lucide-react'
import type { Department } from '@/lib/guatemala-departments'

interface DestinationSelectorModalProps {
  department: Department
  isOpen: boolean
  onClose: () => void
  onSelect: (destination: string) => void
  type: 'from' | 'to'
}

export default function DestinationSelectorModal({
  department,
  isOpen,
  onClose,
  onSelect,
  type
}: DestinationSelectorModalProps) {
  const [selectedDestination, setSelectedDestination] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen) return null

  const handleSelect = () => {
    if (selectedDestination) {
      onSelect(selectedDestination)
      onClose()
    }
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-[200]">
      <div className="bg-white dark:bg-luxury-charcoal dark:border dark:border-gray-800 rounded-none md:rounded-none shadow-xl w-full md:max-w-md max-h-[90vh] md:max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold">
              Select {type === 'from' ? 'Departure' : 'Destination'} in {department.name}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1 -m-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Airports Section */}
          {department.airports.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                <Plane className="h-5 w-5 mr-2 text-primary-600 dark:text-gold-400" />
                Airports
              </h3>
              <div className="space-y-2">
                {department.airports.map((airport) => (
                  <button
                    key={airport.code}
                    onClick={() => setSelectedDestination(airport.name)}
                    className={`w-full text-left p-3 rounded-none border-2 transition-all touch-manipulation ${
                      selectedDestination === airport.name
                        ? 'border-primary-500 dark:border-gold-500 bg-primary-50 dark:bg-gold-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 active:border-primary-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{airport.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {airport.code} • {airport.type.charAt(0).toUpperCase() + airport.type.slice(1)}
                        </p>
                      </div>
                      <Plane className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cities/Destinations Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
              <MapPin className="h-5 w-5 mr-2 text-primary-600 dark:text-gold-400" />
              Cities & Destinations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {department.destinations.map((destination) => (
                <button
                  key={destination}
                  onClick={() => setSelectedDestination(destination)}
                  className={`p-3 rounded-none border-2 transition-all touch-manipulation ${
                    selectedDestination === destination
                      ? 'border-primary-500 dark:border-gold-500 bg-primary-50 dark:bg-gold-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 active:border-primary-300'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{destination}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Experiences Available */}
          {department.experiences.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                <Mountain className="h-5 w-5 mr-2 text-primary-600 dark:text-gold-400" />
                Available Experiences
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-none p-3">
                <ul className="space-y-1">
                  {department.experiences.map((experience, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                      • {experience}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-none text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedDestination}
              className={`flex-1 px-4 py-2 rounded-none font-medium transition-colors ${
                selectedDestination
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Select {selectedDestination || 'Destination'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Portal to document.body to escape any stacking context (WebGL canvas compositing layers)
  if (mounted) {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}