'use client'

import dynamic from 'next/dynamic'
import type { Department } from '@/lib/guatemala-departments'

interface SafeMapWrapperProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

// Loading placeholder component
const MapLoadingPlaceholder = () => (
  <div className="w-full h-96 sm:h-[500px] bg-gray-100 dark:bg-luxury-black/50 flex items-center justify-center rounded-soft">
    <div className="text-center">
      <div className="loading-spinner mx-auto mb-2 text-gold-500"></div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map...</p>
    </div>
  </div>
)

// Use Leaflet directly - reliable across all environments
// MapLibre has WebGL worker bundling issues on Vercel deployments
const GuatemalaLeafletMap = dynamic(
  () => import('@/components/guatemala-leaflet-map'),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />
  }
)

export default function SafeMapWrapper(props: SafeMapWrapperProps) {
  return <GuatemalaLeafletMap {...props} />
}
