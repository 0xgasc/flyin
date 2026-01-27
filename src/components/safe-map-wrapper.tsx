'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Department } from '@/lib/guatemala-departments'

interface SafeMapWrapperProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

// Check if WebGL is supported - must run on client
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

// Only load the map component if we've verified WebGL works
const GuatemalaMapLibre = dynamic(
  () => import('@/components/guatemala-maplibre'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 sm:h-[500px] bg-luxury-black/50 flex items-center justify-center rounded">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand-accent border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }
)

// Fallback when WebGL is not available
function MapFallback() {
  return (
    <div className="relative w-full">
      <div className="rounded overflow-hidden shadow-2xl border border-luxury-slate/30 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="w-full h-96 sm:h-[500px] flex flex-col items-center justify-center text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-white mb-2">Interactive Map Unavailable</h3>
          <p className="text-gray-400 mb-4 max-w-md">
            Your browser does not support WebGL, which is required for the interactive map.
          </p>
          <p className="text-sm text-gray-500">
            Try enabling hardware acceleration in Chrome settings, or use Safari/Firefox.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SafeMapWrapper(props: SafeMapWrapperProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)

  useEffect(() => {
    // Check WebGL support on mount
    setWebglSupported(checkWebGLSupport())
  }, [])

  // Still checking
  if (webglSupported === null) {
    return (
      <div className="w-full h-96 sm:h-[500px] bg-luxury-black/50 flex items-center justify-center rounded">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand-accent border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Checking compatibility...</p>
        </div>
      </div>
    )
  }

  // WebGL not supported - show fallback
  if (!webglSupported) {
    return <MapFallback />
  }

  // WebGL supported - render actual map
  return <GuatemalaMapLibre {...props} />
}
