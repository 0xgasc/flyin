'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'
import { useMapDestinations, type MapDestination } from '@/hooks/useMapDestinations'

interface GuatemalaMapLibreProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

// Check if WebGL is supported
function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

// Guatemala destination coordinates with rich descriptions
interface Destination {
  name: string
  coordinates: [number, number] // [lng, lat]
  dept: string
  isHub?: boolean
  description: string
  airportCode?: string
  airportName?: string
  highlights?: string[]
  imageUrl?: string // For future image support
}

const destinations: Destination[] = [
  {
    name: 'Ciudad de Guatemala',
    coordinates: [-90.5069, 14.6349],
    dept: 'Guatemala',
    isHub: true,
    description: 'Capital city and main hub. La Aurora International Airport serves as the gateway to Guatemala.',
    airportCode: 'GUA',
    airportName: 'La Aurora International',
    highlights: ['International Airport', 'Business Hub', 'Central Location']
  },
  {
    name: 'Antigua Guatemala',
    coordinates: [-90.7295, 14.5586],
    dept: 'Sacatepéquez',
    description: 'UNESCO World Heritage colonial city surrounded by volcanoes. Famous for cobblestone streets and Spanish Baroque architecture.',
    highlights: ['UNESCO Site', 'Colonial Architecture', 'Volcano Views']
  },
  {
    name: 'Lake Atitlán',
    coordinates: [-91.1867, 14.6989],
    dept: 'Sololá',
    description: 'Stunning volcanic lake surrounded by Mayan villages. Often called the most beautiful lake in the world.',
    highlights: ['Scenic Flights', 'Mayan Culture', 'Volcano Backdrop']
  },
  {
    name: 'Panajachel',
    coordinates: [-91.1575, 14.7427],
    dept: 'Sololá',
    description: 'Gateway town to Lake Atitlán with vibrant markets and lakeside restaurants.',
    highlights: ['Lake Access', 'Local Markets', 'Tourism Hub']
  },
  {
    name: 'Tikal National Park',
    coordinates: [-89.6233, 17.2220],
    dept: 'Petén',
    description: 'Ancient Mayan city with towering pyramids rising above the rainforest canopy. UNESCO World Heritage Site.',
    highlights: ['Mayan Pyramids', 'Jungle Wildlife', 'Archaeological Wonder']
  },
  {
    name: 'Flores',
    coordinates: [-89.8833, 16.9256],
    dept: 'Petén',
    description: 'Charming island town on Lake Petén Itzá. Gateway to Tikal with colorful architecture.',
    airportCode: 'FRS',
    airportName: 'Mundo Maya International',
    highlights: ['Island Town', 'Tikal Gateway', 'Lake Views']
  },
  {
    name: 'Semuc Champey',
    coordinates: [-89.9530, 15.5333],
    dept: 'Alta Verapaz',
    description: 'Natural limestone bridge with stunning turquoise pools cascading through the jungle.',
    highlights: ['Natural Pools', 'Jungle Paradise', 'Adventure']
  },
  {
    name: 'Lanquín',
    coordinates: [-89.9797, 15.5781],
    dept: 'Alta Verapaz',
    description: 'Gateway to Semuc Champey. Famous for its cave system and bat exodus at sunset.',
    highlights: ['Cave System', 'Semuc Access', 'Eco-Tourism']
  },
  {
    name: 'Monterrico Beach',
    coordinates: [-90.4830, 13.8950],
    dept: 'Santa Rosa',
    description: 'Pacific coast black sand beach. Sea turtle nesting site and mangrove ecosystem.',
    highlights: ['Black Sand Beach', 'Sea Turtles', 'Pacific Coast']
  },
  {
    name: 'Livingston',
    coordinates: [-88.7494, 15.8289],
    dept: 'Izabal',
    description: 'Garifuna cultural center on the Caribbean coast. Only accessible by boat, rich in Afro-Caribbean heritage.',
    highlights: ['Garifuna Culture', 'Caribbean Vibes', 'Unique Access']
  },
  {
    name: 'Cobán',
    coordinates: [-90.3707, 15.4725],
    dept: 'Alta Verapaz',
    description: 'Cloud forest capital in the highlands. Center of coffee and cardamom production.',
    airportCode: 'CBV',
    airportName: 'Cobán Airport',
    highlights: ['Cloud Forest', 'Coffee Region', 'Cool Climate']
  },
  {
    name: 'Huehuetenango',
    coordinates: [-91.4711, 15.3198],
    dept: 'Huehuetenango',
    description: 'Gateway to the Cuchumatanes mountains, the highest non-volcanic range in Central America.',
    airportCode: 'HUG',
    airportName: 'Huehuetenango Airport',
    highlights: ['Mountain Range', 'Indigenous Culture', 'High Altitude']
  },
  {
    name: 'Quetzaltenango (Xela)',
    coordinates: [-91.5186, 14.8347],
    dept: 'Quetzaltenango',
    description: 'Guatemala\'s second largest city. Known for hot springs, nearby volcanoes, and indigenous markets.',
    highlights: ['Hot Springs', 'Volcano Tours', 'Highland Culture']
  },
  {
    name: 'Puerto Barrios',
    coordinates: [-88.5942, 15.7333],
    dept: 'Izabal',
    description: 'Caribbean port city. Gateway to boat trips along Río Dulce to Livingston.',
    airportCode: 'PBR',
    airportName: 'Puerto Barrios Airport',
    highlights: ['Caribbean Port', 'Boat Access', 'Tropical Climate']
  },
  {
    name: 'Río Dulce',
    coordinates: [-89.0333, 15.6500],
    dept: 'Izabal',
    description: 'Scenic river connecting Lake Izabal to the Caribbean. Jungle-lined canyon with hot waterfalls.',
    highlights: ['River Canyon', 'Hot Springs', 'Jungle Scenery']
  },
  {
    name: 'El Mirador',
    coordinates: [-89.9208, 17.7553],
    dept: 'Petén',
    description: 'Remote ancient Mayan city with La Danta, one of the largest pyramids by volume in the world.',
    highlights: ['Ancient Ruins', 'Remote Location', 'Largest Pyramid']
  },
  {
    name: 'Esquipulas',
    coordinates: [-89.3519, 14.5672],
    dept: 'Chiquimula',
    description: 'Important pilgrimage site home to the Black Christ. Draws millions of visitors annually.',
    highlights: ['Pilgrimage Site', 'Black Christ', 'Religious Tourism']
  },
]

export default function GuatemalaMapLibre({
  onDepartmentClick,
  selectedFrom,
  selectedTo,
}: GuatemalaMapLibreProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  // Fetch destinations from API
  const { destinations: apiDestinations, loading: destinationsLoading } = useMapDestinations()

  // Transform API destinations to internal format, with static fallback
  const activeDestinations = useMemo((): Destination[] => {
    if (apiDestinations.length === 0) {
      // Use static fallback if no API data
      return destinations
    }

    return apiDestinations.map((d: MapDestination): Destination => ({
      name: d.name,
      coordinates: [d.coordinates.lng, d.coordinates.lat] as [number, number],
      dept: d.location,
      isHub: d.is_hub,
      description: d.description,
      airportCode: d.airport?.code,
      airportName: d.airport?.name,
      highlights: d.highlights,
      imageUrl: d.primary_image_url
    }))
  }, [apiDestinations])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Check WebGL support before initializing
    if (!isWebGLSupported()) {
      setMapError('WebGL is not supported in your browser. Please try a different browser.')
      return
    }

    try {
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

    // Handle map errors
    map.current.on('error', (e) => {
      console.error('Map error:', e)
      setMapError('Failed to load map. Please try again.')
    })

    } catch (error) {
      console.error('Failed to initialize map:', error)
      setMapError('Failed to initialize map. WebGL may not be available.')
    }

    return () => {
      markers.current.forEach(marker => marker.remove())
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers when selection or destinations change
  useEffect(() => {
    if (map.current && !destinationsLoading) {
      markers.current.forEach(marker => marker.remove())
      markers.current = []
      addMarkers()
    }
  }, [selectedFrom, selectedTo, activeDestinations, destinationsLoading])

  const addMarkers = () => {
    if (!map.current) return

    activeDestinations.forEach(dest => {
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

      // Create rich popup card
      const airportBadge = dest.airportCode
        ? `<div class="flex items-center gap-1 mt-2 px-2 py-1 bg-blue-900/50 rounded text-xs text-blue-300">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
            <span>${dest.airportCode} - ${dest.airportName}</span>
          </div>`
        : ''

      const highlightTags = dest.highlights
        ? `<div class="flex flex-wrap gap-1 mt-2">
            ${dest.highlights.map(h => `<span class="px-1.5 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded">${h}</span>`).join('')}
          </div>`
        : ''

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
        className: 'location-preview-popup',
        maxWidth: '280px'
      }).setHTML(`
        <div class="location-preview-card">
          ${dest.imageUrl
            ? `<div class="w-full h-24 bg-cover bg-center rounded-t" style="background-image: url('${dest.imageUrl}')"></div>`
            : `<div class="w-full h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-t flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>`
          }
          <div class="p-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-bold text-sm text-white leading-tight">${dest.name}</h3>
                <p class="text-xs text-gray-400 mt-0.5">${dest.dept}, Guatemala</p>
              </div>
              ${dest.isHub ? '<span class="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded font-medium">HUB</span>' : ''}
            </div>
            <p class="text-xs text-gray-300 mt-2 leading-relaxed">${dest.description}</p>
            ${airportBadge}
            ${highlightTags}
            <div class="mt-3 pt-2 border-t border-gray-700">
              ${isSelected
                ? `<p class="text-xs font-medium ${isFromSelected ? 'text-green-400' : 'text-amber-400'}">${isFromSelected ? '✓ Selected as Origin' : '✓ Selected as Destination'}</p>`
                : '<p class="text-xs text-gray-500">Click to select this location</p>'
              }
            </div>
          </div>
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
      const fromDest = activeDestinations.find(d => d.name === selectedFrom)
      const toDest = activeDestinations.find(d => d.name === selectedTo)

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

  // Show fallback if map fails to load
  if (mapError) {
    return (
      <div className="relative w-full">
        <div className="rounded overflow-hidden shadow-2xl border border-luxury-slate/30 bg-gradient-to-br from-gray-800 to-gray-900 p-8">
          <div className="w-full h-96 sm:h-[500px] flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive Map Unavailable</h3>
            <p className="text-gray-400 mb-4 max-w-md">{mapError}</p>
            <p className="text-sm text-gray-500">You can still browse and book experiences below.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div className="rounded overflow-hidden shadow-2xl border border-luxury-slate/30">
        {/* Map Container */}
        <div
          ref={mapContainer}
          className="w-full h-96 sm:h-[500px]"
        />

        {/* Branding overlay */}
        <div className="absolute top-4 left-4 bg-luxury-black/90 backdrop-blur-sm rounded px-3 py-2 shadow-lg z-10 border border-brand-accent/30">
          <h3 className="font-bold text-brand-accent text-sm">FlyIn Guatemala</h3>
          <p className="text-xs text-gray-400">Interactive Map</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 md:gap-6 justify-center text-xs md:text-sm">
        <div className="flex items-center gap-2 bg-luxury-black/50 px-3 py-2 rounded border border-luxury-slate/30">
          <div className="w-4 h-4 bg-red-600 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-gray-300">Guatemala City Hub</span>
        </div>
        <div className="flex items-center gap-2 bg-luxury-black/50 px-3 py-2 rounded border border-luxury-slate/30">
          <div className="w-4 h-4 bg-blue-600 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-gray-300">Destinations</span>
        </div>
        <div className="flex items-center gap-2 bg-luxury-black/50 px-3 py-2 rounded border border-luxury-slate/30">
          <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-gray-300">Selected</span>
        </div>
      </div>

      {/* Selection Status */}
      <div className="mt-6 text-center bg-luxury-black/30 rounded p-4 backdrop-blur-sm border border-luxury-slate/30">
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
