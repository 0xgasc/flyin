'use client'

import { useState } from 'react'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'

interface GuatemalaSimpleMapProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

// Real Guatemala destination coordinates (calibrated to actual Guatemala map image)
const destinationCoordinates: Record<string, Array<{name: string, x: number, y: number, dept: string}>> = {
  'guatemala': [
    { name: 'Ciudad de Guatemala', x: 52, y: 60, dept: 'Guatemala' }
  ],
  'antigua': [
    { name: 'Antigua Guatemala', x: 48, y: 62, dept: 'Sacatepéquez' }
  ],
  'atitlan': [
    { name: 'Lake Atitlán', x: 35, y: 65, dept: 'Sololá' },
    { name: 'Panajachel', x: 37, y: 63, dept: 'Sololá' }
  ],
  'tikal': [
    { name: 'Tikal National Park', x: 70, y: 18, dept: 'Petén' },
    { name: 'Flores', x: 65, y: 25, dept: 'Petén' }
  ],
  'semuc': [
    { name: 'Semuc Champey', x: 55, y: 42, dept: 'Alta Verapaz' },
    { name: 'Lanquín', x: 56, y: 43, dept: 'Alta Verapaz' }
  ],
  'monterrico': [
    { name: 'Monterrico Beach', x: 48, y: 85, dept: 'Santa Rosa' }
  ],
  'livingston': [
    { name: 'Livingston', x: 78, y: 45, dept: 'Izabal' }
  ],
  'coban': [
    { name: 'Cobán', x: 52, y: 45, dept: 'Alta Verapaz' }
  ],
  'huehuetenango': [
    { name: 'Huehuetenango', x: 22, y: 50, dept: 'Huehuetenango' }
  ],
  'quetzaltenango': [
    { name: 'Quetzaltenango (Xela)', x: 28, y: 68, dept: 'Quetzaltenango' }
  ],
  'puerto-barrios': [
    { name: 'Puerto Barrios', x: 82, y: 40, dept: 'Izabal' }
  ],
  'rio-dulce': [
    { name: 'Río Dulce', x: 75, y: 48, dept: 'Izabal' }
  ],
  'el-mirador': [
    { name: 'El Mirador', x: 72, y: 12, dept: 'Petén' }
  ],
  'esquipulas': [
    { name: 'Esquipulas', x: 72, y: 75, dept: 'Chiquimula' }
  ]
}

// Flatten all destinations for easy mapping
const allDestinations = Object.values(destinationCoordinates).flat()

export default function GuatemalaSimpleMap({ 
  onDepartmentClick, 
  selectedFrom, 
  selectedTo,
  mode = 'both' 
}: GuatemalaSimpleMapProps) {
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null)

  const handleDestinationClick = (destination: any) => {
    // Find the department for this destination
    const department = guatemalaDepartments.find(dept => 
      dept.destinations.includes(destination.name) || 
      dept.name.toLowerCase() === destination.dept.toLowerCase()
    )
    
    if (department && onDepartmentClick) {
      onDepartmentClick(department)
    }
  }

  return (
    <div className="relative w-full">
      <div className="rounded-xl overflow-hidden shadow-2xl">
        {/* Real Guatemala Map Container */}
        <div 
          className="relative w-full h-96 sm:h-[500px] bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Guatemala_location_map.svg/800px-Guatemala_location_map.svg.png')`,
            backgroundColor: '#e6f3ff'
          }}
        >
          {/* Dark overlay for better marker visibility */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Top branding overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-10">
            <h3 className="font-bold text-blue-800 text-sm">FlyIn Guatemala</h3>
            <p className="text-xs text-blue-600">Real Map View</p>
          </div>

          {/* Guatemala City - Central Hub */}
          <div 
            className="absolute z-10 cursor-pointer group"
            style={{ 
              left: `${destinationCoordinates.guatemala[0].x}%`, 
              top: `${destinationCoordinates.guatemala[0].y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
            onClick={() => handleDestinationClick(destinationCoordinates.guatemala[0])}
            onMouseEnter={() => setHoveredDestination('Ciudad de Guatemala')}
            onMouseLeave={() => setHoveredDestination(null)}
          >
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75 w-6 h-6 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
            {/* Main marker */}
            <div className="relative w-5 h-5 bg-red-600 border-2 border-white rounded-full shadow-lg group-hover:scale-125 transition-transform duration-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            {/* Hub label */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-medium shadow-lg">
              Guatemala City Hub
            </div>
          </div>

          {/* All Destination Markers */}
          {allDestinations.filter(dest => dest.name !== 'Ciudad de Guatemala').map((destination, idx) => {
            const isSelected = selectedFrom === destination.name || selectedTo === destination.name
            return (
              <div
                key={idx}
                className="absolute z-10 cursor-pointer group"
                style={{ 
                  left: `${destination.x}%`, 
                  top: `${destination.y}%`, 
                  transform: 'translate(-50%, -50%)' 
                }}
                onClick={() => handleDestinationClick(destination)}
                onMouseEnter={() => setHoveredDestination(destination.name)}
                onMouseLeave={() => setHoveredDestination(null)}
              >
                {/* Selection ring for selected destinations */}
                {isSelected && (
                  <div className="absolute inset-0 bg-yellow-400 rounded-full w-5 h-5 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 animate-pulse"></div>
                )}
                {/* Main marker */}
                <div className={`relative w-4 h-4 border-2 border-white rounded-full shadow-lg group-hover:scale-125 transition-transform duration-200 ${
                  isSelected ? 'bg-yellow-500' : 'bg-blue-600'
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Hover Info Box - Fixed position to avoid clipping */}
          {hoveredDestination && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-3 max-w-xs z-20 pointer-events-none">
              <h3 className="font-bold text-blue-800 text-sm">{hoveredDestination}</h3>
              <p className="text-xs text-gray-600">Click to select as destination</p>
              {(selectedFrom === hoveredDestination || selectedTo === hoveredDestination) && (
                <p className="text-xs text-yellow-600 font-medium mt-1">✓ Selected</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 md:gap-6 justify-center text-xs md:text-sm">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-4 h-4 bg-red-600 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-slate-200">Guatemala City Hub</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-4 h-4 bg-blue-600 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-slate-200">Tourist Destinations</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-slate-200">Selected</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <span className="text-slate-300">🗺️ Real Guatemala Geography</span>
        </div>
      </div>
      
      {/* Selection Status */}
      <div className="mt-6 text-center bg-slate-800/30 rounded-xl p-4 backdrop-blur-sm">
        {selectedFrom && (
          <p className="text-sm text-slate-300 mb-1">
            From: <span className="font-semibold text-yellow-400">{selectedFrom}</span>
          </p>
        )}
        {selectedTo && (
          <p className="text-sm text-slate-300">
            To: <span className="font-semibold text-yellow-400">{selectedTo}</span>
          </p>
        )}
        {!selectedFrom && !selectedTo && (
          <p className="text-sm text-slate-400">Click destinations to select your route</p>
        )}
      </div>
    </div>
  )
}