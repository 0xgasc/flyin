'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin panel error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-black flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-luxury-charcoal rounded-lg shadow-xl p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Panel Error
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          An error occurred in the admin panel. Try refreshing or return to the dashboard.
        </p>

        <div className="flex gap-3">
          <button onClick={reset} className="flex-1 btn-primary">
            Retry
          </button>
          <Link href="/admin" className="flex-1 btn-ghost flex items-center justify-center gap-2">
            <Home className="h-4 w-4" />
            Admin Home
          </Link>
        </div>
      </div>
    </div>
  )
}
