'use client'

import { CheckCircle } from 'lucide-react'

type BookingStep = 'route' | 'schedule' | 'passengers' | 'review' | 'payment'

interface BookingProgressProps {
  currentStep: BookingStep
  bookingType?: 'transport' | 'experience'
}

const steps: { id: BookingStep; label: string; labelEs: string }[] = [
  { id: 'route', label: 'Route', labelEs: 'Ruta' },
  { id: 'schedule', label: 'Schedule', labelEs: 'Horario' },
  { id: 'passengers', label: 'Passengers', labelEs: 'Pasajeros' },
  { id: 'review', label: 'Review', labelEs: 'Revisar' },
  { id: 'payment', label: 'Payment', labelEs: 'Pago' },
]

export function BookingProgress({ currentStep, bookingType = 'transport' }: BookingProgressProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-colors duration-200
                    ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium hidden sm:block
                    ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Compact version for mobile
export function BookingProgressCompact({ currentStep }: BookingProgressProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  const current = steps[currentIndex]

  return (
    <div className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Step {currentIndex + 1} of {steps.length}
      </span>
      <span className="text-sm font-medium text-primary-600">
        {current?.label}
      </span>
    </div>
  )
}

export default BookingProgress
