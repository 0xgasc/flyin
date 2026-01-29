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
  compact?: boolean
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
  {
    name: 'El Paredon',
    coordinates: [-91.1833, 13.9167],
    dept: 'Escuintla',
    description: 'Pacific coast surf town with consistent waves and sea turtle conservation. Guatemala\'s top surf destination.',
    highlights: ['Surf Breaks', 'Sea Turtles', 'Beach Vibes']
  },
]

export default function GuatemalaMapLibre({
  onDepartmentClick,
  selectedFrom,
  selectedTo,
  compact = false,
}: GuatemalaMapLibreProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  const [mapError, setMapError] = useState<string | null>(null)

  // Tooltip state - managed by React for reliability
  const [hoveredDest, setHoveredDest] = useState<Destination | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

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

    // Find departments for selected locations to handle name mismatches
    const fromDept = selectedFrom ? guatemalaDepartments.find(dept =>
      dept.destinations.includes(selectedFrom) ||
      dept.airports.some(a => a.name === selectedFrom)
    ) : null
    const toDept = selectedTo ? guatemalaDepartments.find(dept =>
      dept.destinations.includes(selectedTo) ||
      dept.airports.some(a => a.name === selectedTo)
    ) : null

    activeDestinations.forEach(dest => {
      const isFromSelected = selectedFrom === dest.name ||
        selectedFrom === dest.airportName ||
        (fromDept != null && dest.dept.toLowerCase() === fromDept.name.toLowerCase())
      const isToSelected = selectedTo === dest.name ||
        selectedTo === dest.airportName ||
        (toDept != null && dest.dept.toLowerCase() === toDept.name.toLowerCase())
      const isSelected = isFromSelected || isToSelected

      // Create marker element - simple, no embedded tooltip
      const el = document.createElement('div')
      el.className = 'marker-container'

      if (dest.isHub) {
        // Guatemala City hub - larger red marker
        el.innerHTML = `
          <div class="marker-wrapper">
            <div class="absolute -inset-2 bg-red-500 rounded-full animate-ping opacity-40"></div>
            <div class="marker-dot hub"></div>
          </div>
        `
      } else if (isSelected) {
        // Selected destination - emerald marker
        el.innerHTML = `
          <div class="marker-wrapper">
            <div class="absolute -inset-1 bg-emerald-500 rounded-full animate-pulse opacity-60"></div>
            <div class="marker-dot ${isFromSelected ? 'selected-from' : 'selected-to'}"></div>
          </div>
        `
      } else {
        // Regular destination - navy marker
        el.innerHTML = `
          <div class="marker-wrapper">
            <div class="marker-dot regular"></div>
          </div>
        `
      }

      // Create and add marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(dest.coordinates)
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

      // Handle hover - update React state for tooltip
      el.addEventListener('mouseenter', () => {
        const rect = el.getBoundingClientRect()
        setHoveredDest(dest)
        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 })
      })

      el.addEventListener('mouseleave', () => {
        setHoveredDest(null)
        setTooltipPos(null)
      })

      markers.current.push(marker)
    })

    // Draw line between selected points
    if (selectedFrom && selectedTo) {
      const fromDest = activeDestinations.find(d => d.name === selectedFrom || d.airportName === selectedFrom) ||
        activeDestinations.find(d => fromDept && d.dept.toLowerCase() === fromDept.name.toLowerCase())
      const toDest = activeDestinations.find(d => d.name === selectedTo || d.airportName === selectedTo) ||
        activeDestinations.find(d => toDept && d.dept.toLowerCase() === toDept.name.toLowerCase())

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
      <div className="rounded shadow-2xl border border-luxury-slate/30 relative" style={{ overflow: 'visible' }}>
        {/* Map Container */}
        <div
          ref={mapContainer}
          className={`w-full rounded ${compact ? 'h-64 sm:h-72' : 'h-96 sm:h-[500px]'}`}
          style={{ overflow: 'hidden' }}
        />

        {/* Branding overlay - hidden in compact mode */}
        {!compact && (
          <div className="absolute top-4 left-4 bg-luxury-black/90 backdrop-blur-sm rounded px-3 py-2 shadow-lg z-10 border border-brand-accent/30">
            <h3 className="font-bold text-brand-accent text-sm">FlyIn Guatemala</h3>
            <p className="text-xs text-gray-400">Interactive Map</p>
          </div>
        )}
      </div>

      {/* React-rendered tooltip - outside map container to avoid clipping */}
      {hoveredDest && tooltipPos && (
        <div
          className="fixed z-[40] pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-[#141414] border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px] max-w-[260px]">
            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-700" />
            <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-transparent border-b-[#141414]" />

            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-semibold text-white text-sm">{hoveredDest.name}</span>
              {hoveredDest.isHub && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded font-medium">HUB</span>
              )}
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">{hoveredDest.description}</p>
            {hoveredDest.airportCode && (
              <div className="mt-2 px-2 py-1 bg-blue-500/15 rounded text-[11px] text-blue-300">
                ✈ {hoveredDest.airportCode}{hoveredDest.airportName ? ` — ${hoveredDest.airportName}` : ''}
              </div>
            )}
            {selectedFrom && (selectedFrom === hoveredDest.name || selectedFrom === hoveredDest.airportName ||
              guatemalaDepartments.some(dept =>
                dept.name.toLowerCase() === hoveredDest.dept.toLowerCase() &&
                (dept.destinations.includes(selectedFrom) || dept.airports.some(a => a.name === selectedFrom))
              )) && (
              <div className="mt-2 px-2 py-1 bg-emerald-500/15 rounded text-[11px] text-emerald-300 font-medium">
                Selected as Origin
              </div>
            )}
            {selectedTo && (selectedTo === hoveredDest.name || selectedTo === hoveredDest.airportName ||
              guatemalaDepartments.some(dept =>
                dept.name.toLowerCase() === hoveredDest.dept.toLowerCase() &&
                (dept.destinations.includes(selectedTo) || dept.airports.some(a => a.name === selectedTo))
              )) && (
              <div className="mt-2 px-2 py-1 bg-amber-500/15 rounded text-[11px] text-amber-300 font-medium">
                Selected as Destination
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend - hidden in compact mode */}
      {!compact && (
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
      )}

      {/* Selection Status - hidden in compact mode */}
      {!compact && (
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
      )}
    </div>
  )
}
