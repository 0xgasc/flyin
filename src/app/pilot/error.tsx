'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { MobileNav } from '@/components/mobile-nav'

export default function PilotError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Pilot dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      <MobileNav />

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Pilot Dashboard Error
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            We encountered an issue loading your pilot dashboard. Please try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={reset} className="btn-primary flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link href="/pilot" className="btn-ghost flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Pilot Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
