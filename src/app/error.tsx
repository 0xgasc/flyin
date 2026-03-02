'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { MobileNav } from '@/components/mobile-nav'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black">
      <MobileNav />

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Oops! Something went wrong
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Don't worry—we've been notified and are looking into it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>

            <Link href="/" className="btn-ghost flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error details (dev only)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
