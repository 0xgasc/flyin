'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'

interface GuatemalaMapLibreProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

// Guatemala destination coordinates (lat, lng)
const destinations: Array<{
  name: string
  coordinates: [number, number] // [lng, lat]
  dept: string
  isHub?: boolean
}> = [
  { name: 'Ciudad de Guatemala', coordinates: [-90.5069, 14.6349], dept: 'Guatemala', isHub: true },
  { name: 'Antigua Guatemala', coordinates: [-90.7295, 14.5586], dept: 'Sacatepéquez' },
  { name: 'Lake Atitlán', coordinates: [-91.1867, 14.6989], dept: 'Sololá' },
  { name: 'Panajachel', coordinates: [-91.1575, 14.7427], dept: 'Sololá' },
  { name: 'Tikal National Park', coordinates: [-89.6233, 17.2220], dept: 'Petén' },
  { name: 'Flores', coordinates: [-89.8833, 16.9256], dept: 'Petén' },
  { name: 'Semuc Champey', coordinates: [-89.9530, 15.5333], dept: 'Alta Verapaz' },
  { name: 'Lanquín', coordinates: [-89.9797, 15.5781], dept: 'Alta Verapaz' },
  { name: 'Monterrico Beach', coordinates: [-90.4830, 13.8950], dept: 'Santa Rosa' },
  { name: 'Livingston', coordinates: [-88.7494, 15.8289], dept: 'Izabal' },
  { name: 'Cobán', coordinates: [-90.3707, 15.4725], dept: 'Alta Verapaz' },
  { name: 'Huehuetenango', coordinates: [-91.4711, 15.3198], dept: 'Huehuetenango' },
  { name: 'Quetzaltenango (Xela)', coordinates: [-91.5186, 14.8347], dept: 'Quetzaltenango' },
  { name: 'Puerto Barrios', coordinates: [-88.5942, 15.7333], dept: 'Izabal' },
  { name: 'Río Dulce', coordinates: [-89.0333, 15.6500], dept: 'Izabal' },
  { name: 'El Mirador', coordinates: [-89.9208, 17.7553], dept: 'Petén' },
  { name: 'Esquipulas', coordinates: [-89.3519, 14.5672], dept: 'Chiquimula' },
]

export default function GuatemalaMapLibre({
  onDepartmentClick,
  selectedFrom,
  selectedTo,
  mode = 'both'
}: GuatemalaMapLibreProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map with free OpenStreetMap tiles
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [-90.2308, 15.7835], // Center of Guatemala
      zoom: 6.5,
      minZoom: 5,
      maxZoom: 12
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Add markers when map loads
    map.current.on('load', () => {
      addMarkers()
    })

    return () => {
      markers.current.forEach(marker => marker.remove())
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers when selection changes
  useEffect(() => {
    if (map.current) {
      markers.current.forEach(marker => marker.remove())
      markers.current = []
      addMarkers()
    }
  }, [selectedFrom, selectedTo])

  const addMarkers = () => {
    if (!map.current) return

    destinations.forEach(dest => {
      const isSelected = selectedFrom === dest.name || selectedTo === dest.name
      const isFromSelected = selectedFrom === dest.name
      const isToSelected = selectedTo === dest.name

      // Create marker element
      const el = document.createElement('div')
      el.className = 'marker-container'

      if (dest.isHub) {
        // Guatemala City hub - larger red marker
        el.innerHTML = `
          <div class="relative cursor-pointer group">
            <div class="absolute -inset-2 bg-red-500 rounded-full animate-ping opacity-40"></div>
            <div class="relative w-6 h-6 bg-red-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-125">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        `
      } else if (isSelected) {
        // Selected destination - emerald marker
        el.innerHTML = `
          <div class="relative cursor-pointer group">
            <div class="absolute -inset-1 bg-emerald-500 rounded-full animate-pulse opacity-60"></div>
            <div class="relative w-5 h-5 ${isFromSelected ? 'bg-emerald-500' : 'bg-amber-500'} border-2 border-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-125">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        `
      } else {
        // Regular destination - navy marker
        el.innerHTML = `
          <div class="relative cursor-pointer group">
            <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-125">
              <div class="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        `
      }

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        className: 'custom-popup'
      }).setHTML(`
        <div class="p-2 min-w-[120px]">
          <h3 class="font-bold text-sm text-gray-900">${dest.name}</h3>
          <p class="text-xs text-gray-600">${dest.dept}</p>
          ${isSelected ? '<p class="text-xs text-emerald-600 font-medium mt-1">Selected</p>' : '<p class="text-xs text-gray-500 mt-1">Click to select</p>'}
        </div>
      `)

      // Create and add marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(dest.coordinates)
        .setPopup(popup)
        .addTo(map.current!)

      // Handle click
      el.addEventListener('click', () => {
        const department = guatemalaDepartments.find(dept =>
          dept.destinations.includes(dest.name) ||
          dept.name.toLowerCase() === dest.dept.toLowerCase()
        )
        if (department && onDepartmentClick) {
          onDepartmentClick(department)
        }
      })

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        marker.togglePopup()
        setHoveredDestination(dest.name)
      })
      el.addEventListener('mouseleave', () => {
        marker.togglePopup()
        setHoveredDestination(null)
      })

      markers.current.push(marker)
    })

    // Draw line between selected points
    if (selectedFrom && selectedTo) {
      const fromDest = destinations.find(d => d.name === selectedFrom)
      const toDest = destinations.find(d => d.name === selectedTo)

      if (fromDest && toDest && map.current) {
        // Remove existing route layer if present
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route')
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route')
        }

        // Add route line
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [fromDest.coordinates, toDest.coordinates]
            }
          }
        })

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10b981',
            'line-width': 3,
            'line-dasharray': [2, 2]
          }
        })
      }
    }
  }

  return (
    <div className="relative w-full">
      <div className="rounded-none overflow-hidden shadow-2xl border border-luxury-slate/30">
        {/* Map Container */}
        <div
          ref={mapContainer}
          className="w-full h-96 sm:h-[500px]"
        />

        {/* Branding overlay */}
        <div className="absolute top-4 left-4 bg-luxury-black/90 backdrop-blur-sm rounded-none px-3 py-2 shadow-lg z-10 border border-brand-accent/30">
          <h3 className="font-bold text-brand-accent text-sm">FlyIn Guatemala</h3>
          <p className="text-xs text-gray-400">Interactive Map</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 md:gap-6 justify-center text-xs md:text-sm">
        <div className="flex items-center gap-2 bg-luxury-black/50 px-3 py-2 rounded-none border border-luxury-slate/30">
          <div className="w-4 h-4 bg-red-600 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-gray-300">Guatemala City Hub</span>
        </div>
        <div className="flex items-center gap-2 bg-luxury-black/50 px-3 py-2 rounded-none border border-luxury-slate/30">
          <div className="w-4 h-4 bg-blue-600 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-gray-300">Destinations</span>
        </div>
        <div className="flex items-center gap-2 bg-luxury-black/50 px-3 py-2 rounded-none border border-luxury-slate/30">
          <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-gray-300">Selected</span>
        </div>
      </div>

      {/* Selection Status */}
      <div className="mt-6 text-center bg-luxury-black/30 rounded-none p-4 backdrop-blur-sm border border-luxury-slate/30">
        {selectedFrom && (
          <p className="text-sm text-gray-300 mb-1">
            From: <span className="font-semibold text-brand-accent">{selectedFrom}</span>
          </p>
        )}
        {selectedTo && (
          <p className="text-sm text-gray-300">
            To: <span className="font-semibold text-amber-400">{selectedTo}</span>
          </p>
        )}
        {!selectedFrom && !selectedTo && (
          <p className="text-sm text-gray-400">Click destinations to select your route</p>
        )}
      </div>
    </div>
  )
}
