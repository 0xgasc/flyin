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

// Only load the MapLibre component if we've verified WebGL works
const GuatemalaMapLibre = dynamic(
  () => import('@/components/guatemala-maplibre'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 sm:h-[500px] bg-gray-100 dark:bg-luxury-black/50 flex items-center justify-center rounded-soft">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-2 text-gold-500"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }
)

// SVG map fallback - loads when WebGL is not available
const GuatemalaSVGMap = dynamic(
  () => import('@/components/guatemala-svg-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 sm:h-[500px] bg-gray-100 dark:bg-luxury-black/50 flex items-center justify-center rounded-soft">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-2 text-gold-500"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }
)

export default function SafeMapWrapper(props: SafeMapWrapperProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)

  useEffect(() => {
    // Check WebGL support on mount
    setWebglSupported(checkWebGLSupport())
  }, [])

  // Still checking
  if (webglSupported === null) {
    return (
      <div className="w-full h-96 sm:h-[500px] bg-gray-100 dark:bg-luxury-black/50 flex items-center justify-center rounded-soft">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-2 text-gold-500"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Checking compatibility...</p>
        </div>
      </div>
    )
  }

  // WebGL not supported - show interactive SVG map fallback
  if (!webglSupported) {
    return <GuatemalaSVGMap {...props} />
  }

  // WebGL supported - render MapLibre map
  return <GuatemalaMapLibre {...props} />
}
