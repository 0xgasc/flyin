'use client'

import { useEffect, useRef, useMemo } from 'react'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'
import 'leaflet/dist/leaflet.css'

// Dynamically import Leaflet to avoid SSR issues
let L: typeof import('leaflet') | null = null

interface GuatemalaLeafletMapProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

export default function GuatemalaLeafletMap({
  onDepartmentClick,
  selectedFrom,
  selectedTo,
}: GuatemalaLeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const flightPathRef = useRef<any>(null)

  // Calculate positions for all departments
  const departmentPositions = useMemo(() => {
    return guatemalaDepartments.map(dept => ({
      ...dept,
      lat: dept.coordinates[0],
      lng: dept.coordinates[1]
    }))
  }, [])

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Dynamically import Leaflet
      L = await import('leaflet')

      // Guatemala center coordinates
      const guatemalaCenter: [number, number] = [15.5, -90.3]

      // Create map
      const map = L.map(mapRef.current, {
        center: guatemalaCenter,
        zoom: 7,
        minZoom: 6,
        maxZoom: 12,
        zoomControl: true,
        attributionControl: true,
      })

      // Add tile layer - using CartoDB for a cleaner look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map)

      mapInstanceRef.current = map

      // Add markers for each department
      addMarkers()
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Function to add markers
  const addMarkers = () => {
    if (!mapInstanceRef.current || !L) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    departmentPositions.forEach(dept => {
      const isSelected = dept.id === selectedFrom || dept.id === selectedTo
      const isFrom = dept.id === selectedFrom
      const isTo = dept.id === selectedTo
      const hasAirport = dept.airports.length > 0

      // Create custom icon
      const iconSize = isSelected ? 16 : 12
      const iconColor = isFrom ? '#22c55e' : isTo ? '#ef4444' : '#d4af37'

      const icon = L!.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            background: ${iconColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ${hasAirport ? `outline: 2px solid ${iconColor}; outline-offset: 2px;` : ''}
            ${isSelected ? 'animation: pulse 2s infinite;' : ''}
          "></div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      })

      const marker = L!.marker([dept.lat, dept.lng], { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div style="min-width: 150px;">
            <h3 style="font-weight: 600; margin: 0 0 4px 0;">${dept.name}</h3>
            ${hasAirport ? `<p style="color: #d4af37; font-size: 12px; margin: 0 0 4px 0;">✈ ${dept.airports.map(a => a.code).join(', ')}</p>` : ''}
            <p style="color: #666; font-size: 12px; margin: 0;">${dept.destinations.slice(0, 3).join(', ')}${dept.destinations.length > 3 ? '...' : ''}</p>
          </div>
        `)
        .on('click', () => {
          if (onDepartmentClick) {
            onDepartmentClick(dept)
          }
        })

      markersRef.current.push(marker)
    })
  }

  // Update markers when selection changes
  useEffect(() => {
    if (mapInstanceRef.current && L) {
      addMarkers()
      updateFlightPath()
    }
  }, [selectedFrom, selectedTo, departmentPositions])

  // Update flight path
  const updateFlightPath = () => {
    if (!mapInstanceRef.current || !L) return

    // Remove existing flight path
    if (flightPathRef.current) {
      flightPathRef.current.remove()
      flightPathRef.current = null
    }

    if (!selectedFrom || !selectedTo) return

    const fromDept = departmentPositions.find(d => d.id === selectedFrom)
    const toDept = departmentPositions.find(d => d.id === selectedTo)

    if (!fromDept || !toDept) return

    // Create curved path using a bezier approximation
    const from: [number, number] = [fromDept.lat, fromDept.lng]
    const to: [number, number] = [toDept.lat, toDept.lng]

    // Calculate control point for curve
    const midLat = (from[0] + to[0]) / 2
    const midLng = (from[1] + to[1]) / 2
    const distance = Math.sqrt(Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2))
    const arcHeight = distance * 0.3

    // Create curved path points
    const points: [number, number][] = []
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const lat = from[0] * (1 - t) * (1 - t) + (midLat + arcHeight) * 2 * (1 - t) * t + to[0] * t * t
      const lng = from[1] * (1 - t) + to[1] * t
      points.push([lat, lng])
    }

    flightPathRef.current = L.polyline(points, {
      color: '#d4af37',
      weight: 3,
      opacity: 0.8,
      dashArray: '10, 5',
      className: 'flight-path'
    }).addTo(mapInstanceRef.current!)

    // Add arrow at the end
    const arrowIcon = L.divIcon({
      className: 'flight-arrow',
      html: `<div style="
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 12px solid #d4af37;
        transform: rotate(${Math.atan2(to[1] - from[1], to[0] - from[0]) * 180 / Math.PI + 90}deg);
      "></div>`,
      iconSize: [16, 12],
      iconAnchor: [8, 6],
    })

    const arrowMarker = L.marker(to, { icon: arrowIcon }).addTo(mapInstanceRef.current!)
    markersRef.current.push(arrowMarker)
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-96 sm:h-[500px] rounded-soft overflow-hidden"
        style={{ background: '#f8fafc' }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-luxury-charcoal rounded-soft shadow-card p-3 text-sm z-[1000]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-700 dark:text-gray-300">From</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-gray-700 dark:text-gray-300">To</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gold-500" style={{ outline: '2px solid #d4af37', outlineOffset: '2px' }}></span>
          <span className="text-gray-700 dark:text-gray-300">Airport</span>
        </div>
      </div>

      {/* Selection summary */}
      {(selectedFrom || selectedTo) && (
        <div className="absolute top-4 left-4 bg-white dark:bg-luxury-charcoal rounded-soft shadow-card p-3 text-sm z-[1000] max-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {selectedFrom ? departmentPositions.find(d => d.id === selectedFrom)?.name || 'Select origin' : 'Select origin'}
            </span>
          </div>
          <div className="text-gold-500 text-center">↓</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {selectedTo ? departmentPositions.find(d => d.id === selectedTo)?.name || 'Select destination' : 'Select destination'}
            </span>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 4px;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .dark .leaflet-control-zoom a {
          background: #1a1a1a;
          color: #fff;
          border-color: #374151;
        }
        .dark .leaflet-control-zoom a:hover {
          background: #2d2d2d;
        }
        .dark .leaflet-control-attribution {
          background: rgba(26, 26, 26, 0.8);
          color: #9ca3af;
        }
        .dark .leaflet-popup-content-wrapper {
          background: #1a1a1a;
          color: #fff;
        }
        .dark .leaflet-popup-tip {
          background: #1a1a1a;
        }
      `}</style>
    </div>
  )
}
