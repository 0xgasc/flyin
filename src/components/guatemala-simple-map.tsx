'use client'

import { useState } from 'react'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'

interface GuatemalaSimpleMapProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

// Real Guatemala destination coordinates (using percentage for responsive scaling)
const destinationCoordinates: Record<string, Array<{name: string, x: number, y: number, dept: string}>> = {
  'guatemala': [
    { name: 'Ciudad de Guatemala', x: 48, y: 52, dept: 'Guatemala' }
  ],
  'antigua': [
    { name: 'Antigua Guatemala', x: 45, y: 55, dept: 'Sacatepéquez' }
  ],
  'atitlan': [
    { name: 'Lake Atitlán', x: 35, y: 58, dept: 'Sololá' },
    { name: 'Panajachel', x: 36, y: 56, dept: 'Sololá' }
  ],
  'tikal': [
    { name: 'Tikal National Park', x: 65, y: 15, dept: 'Petén' },
    { name: 'Flores', x: 60, y: 25, dept: 'Petén' }
  ],
  'semuc': [
    { name: 'Semuc Champey', x: 52, y: 35, dept: 'Alta Verapaz' },
    { name: 'Lanquín', x: 53, y: 36, dept: 'Alta Verapaz' }
  ],
  'monterrico': [
    { name: 'Monterrico Beach', x: 45, y: 75, dept: 'Santa Rosa' }
  ],
  'livingston': [
    { name: 'Livingston', x: 75, y: 40, dept: 'Izabal' }
  ],
  'coban': [
    { name: 'Cobán', x: 50, y: 40, dept: 'Alta Verapaz' }
  ],
  'huehuetenango': [
    { name: 'Huehuetenango', x: 25, y: 45, dept: 'Huehuetenango' }
  ],
  'quetzaltenango': [
    { name: 'Quetzaltenango (Xela)', x: 30, y: 60, dept: 'Quetzaltenango' }
  ],
  'puerto-barrios': [
    { name: 'Puerto Barrios', x: 80, y: 35, dept: 'Izabal' }
  ],
  'rio-dulce': [
    { name: 'Río Dulce', x: 72, y: 42, dept: 'Izabal' }
  ],
  'el-mirador': [
    { name: 'El Mirador', x: 68, y: 10, dept: 'Petén' }
  ],
  'esquipulas': [
    { name: 'Esquipulas', x: 70, y: 65, dept: 'Chiquimula' }
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
      <div className="rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800">
        {/* Map Container with embedded Guatemala SVG outline */}
        <div className="relative w-full h-96 sm:h-[500px]">
          {/* Background Guatemala Shape */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            {/* Simplified Guatemala country outline using real proportions */}
            <path
              d="M15 40 Q20 35 25 30 Q35 25 45 22 Q55 20 65 22 Q75 25 82 30 Q85 35 87 40 Q88 50 85 60 Q82 70 75 75 Q65 78 55 78 Q45 77 35 75 Q25 70 20 60 Q15 50 15 40 Z"
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgba(34, 197, 94, 0.8)"
              strokeWidth="0.5"
              className="drop-shadow-lg"
            />
            
            {/* FlyIn Guatemala Logo */}
            <text x="20" y="20" className="fill-white font-bold text-xs" style={{ fontSize: '4px' }}>
              FlyIn GUATEMALA
            </text>
            <text x="20" y="25" className="fill-white/80 text-xs" style={{ fontSize: '2px' }}>
              Real Map View
            </text>
          </svg>

          {/* Guatemala City - Central Hub */}
          <div 
            className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
            style={{ left: '48%', top: '52%', transform: 'translate(-50%, -50%)' }}
            onClick={() => handleDestinationClick({name: 'Ciudad de Guatemala', dept: 'Guatemala'})}
            onMouseEnter={() => setHoveredDestination('Ciudad de Guatemala')}
            onMouseLeave={() => setHoveredDestination(null)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* All Destination Markers */}
          {allDestinations.map((destination, idx) => (
            <div
              key={idx}
              className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform hover:bg-blue-400"
              style={{ 
                left: `${destination.x}%`, 
                top: `${destination.y}%`, 
                transform: 'translate(-50%, -50%)' 
              }}
              onClick={() => handleDestinationClick(destination)}
              onMouseEnter={() => setHoveredDestination(destination.name)}
              onMouseLeave={() => setHoveredDestination(null)}
            />
          ))}

          {/* Hover Info Box */}
          {hoveredDestination && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-3 max-w-xs z-20 pointer-events-none">
              <h3 className="font-bold text-blue-600 text-sm">{hoveredDestination}</h3>
              <p className="text-xs text-gray-600">Click to select as destination</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 md:gap-6 justify-center text-xs md:text-sm">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full shadow-lg"></div>
          <span className="text-slate-200">Guatemala City Hub</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full shadow-lg"></div>
          <span className="text-slate-200">Tourist Destinations</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <span className="text-slate-300">🗺️ Simplified Real Geography</span>
        </div>
      </div>
      
      {/* Selection Status */}
      <div className="mt-6 text-center bg-slate-800/30 rounded-xl p-4 backdrop-blur-sm">
        {selectedFrom && (
          <p className="text-sm text-slate-300 mb-1">
            From: <span className="font-semibold text-blue-400">{selectedFrom}</span>
          </p>
        )}
        {selectedTo && (
          <p className="text-sm text-slate-300">
            To: <span className="font-semibold text-blue-400">{selectedTo}</span>
          </p>
        )}
        {!selectedFrom && !selectedTo && (
          <p className="text-sm text-slate-400">Click destinations to select your route</p>
        )}
      </div>
    </div>
  )
}