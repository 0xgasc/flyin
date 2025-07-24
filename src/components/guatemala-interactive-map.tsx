'use client'

import { useState } from 'react'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'
import { MapPin, Plane } from 'lucide-react'

interface GuatemalaInteractiveMapProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

export default function GuatemalaInteractiveMap({ 
  onDepartmentClick, 
  selectedFrom, 
  selectedTo,
  mode = 'both' 
}: GuatemalaInteractiveMapProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null)
  const [selectedDept, setSelectedDept] = useState<string | null>(null)

  const handleDepartmentClick = (dept: Department) => {
    setSelectedDept(dept.id)
    if (onDepartmentClick) {
      onDepartmentClick(dept)
    }
  }

  const getDepartmentInfo = (deptId: string): Department | undefined => {
    return guatemalaDepartments.find(d => d.id === deptId)
  }

  // FlyIn Guatemala style - clean outline matching your design
  const guatemalaPath = "M20 120 L15 115 L12 110 L10 100 L12 90 L15 80 L20 70 L30 60 L45 55 L65 50 L90 48 L120 50 L150 52 L180 55 L200 60 L220 70 L235 85 L245 105 L250 125 L248 145 L245 165 L240 180 L230 195 L215 205 L195 210 L170 208 L145 205 L120 200 L95 195 L70 185 L50 170 L35 155 L25 140 L20 120 Z"

  // Positions matching your FlyIn Guatemala reference map exactly
  const destinationPositions: Record<string, Array<{name: string, x: number, y: number}>> = {
    'peten': [
      { name: 'El Mirador', x: 195, y: 40 },
      { name: 'Tikal', x: 185, y: 65 },
      { name: 'Flores', x: 175, y: 85 }
    ],
    'izabal': [
      { name: 'Livingston', x: 245, y: 110 },
      { name: 'Puerto Barrios', x: 250, y: 125 },
      { name: 'Río Dulce', x: 225, y: 115 }
    ],
    'alta-verapaz': [
      { name: 'Sayaxché', x: 150, y: 85 },
      { name: 'Cobán', x: 165, y: 110 }
    ],
    'baja-verapaz': [
      { name: 'Rabinal', x: 145, y: 135 }
    ],
    'zacapa': [
      { name: 'Zacapa', x: 210, y: 145 }
    ],
    'chiquimula': [
      { name: 'Chiquimula', x: 215, y: 160 },
      { name: 'Esquipulas', x: 230, y: 170 }
    ],
    'jalapa': [
      { name: 'Jalapa', x: 185, y: 155 }
    ],
    'el-progreso': [
      { name: 'El Progreso', x: 165, y: 145 }
    ],
    'guatemala': [
      { name: 'Ciudad de Guatemala', x: 145, y: 160 }
    ],
    'sacatepequez': [
      { name: 'Antigua', x: 135, y: 165 }
    ],
    'chimaltenango': [
      { name: 'Chimaltenango', x: 125, y: 155 }
    ],
    'escuintla': [
      { name: 'Monterrico', x: 135, y: 195 },
      { name: 'San José', x: 115, y: 205 }
    ],
    'santa-rosa': [
      { name: 'Santa Rosa', x: 165, y: 185 }
    ],
    'jutiapa': [
      { name: 'Jutiapa', x: 195, y: 190 }
    ],
    'huehuetenango': [
      { name: 'Huehuetenango', x: 65, y: 95 },
      { name: 'Nebaj', x: 95, y: 120 }
    ],
    'quiche': [
      { name: 'Quiché', x: 115, y: 125 }
    ],
    'san-marcos': [
      { name: 'San Marcos', x: 45, y: 155 }
    ],
    'quetzaltenango': [
      { name: 'Xela', x: 75, y: 155 }
    ],
    'totonicapan': [
      { name: 'Totonicapán', x: 105, y: 145 }
    ],
    'solola': [
      { name: 'Atitlán', x: 95, y: 165 }
    ],
    'suchitepequez': [
      { name: 'Mazatenango', x: 85, y: 185 }
    ],
    'retalhuleu': [
      { name: 'Retalhuleu', x: 65, y: 195 }
    ]
  }

  return (
    <div className="relative w-full">
      {/* Map Container - FlyIn Guatemala Style */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 shadow-2xl">
        {/* SVG Map */}
        <svg 
          viewBox="0 0 270 250" 
          className="w-full h-full touch-manipulation filter drop-shadow-lg"
          style={{ 
            maxHeight: '500px',
            minHeight: '300px'
          }}
        >
          {/* Guatemala Country Outline - FlyIn Style */}
          <path
            d={guatemalaPath}
            fill="rgba(37, 99, 235, 0.8)"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
            className="pointer-events-none"
          />
          
          {/* Destination Dots */}
          {guatemalaDepartments.map((dept) => {
            const destinations = destinationPositions[dept.id] || []
            
            return (
              <g key={dept.id}>
                {/* Destination Dots */}
                {destinations.map((destination, idx) => (
                  <g key={idx}>
                    <circle
                      cx={destination.x}
                      cy={destination.y}
                      r="5"
                      fill="rgba(255, 255, 255, 0.95)"
                      stroke="rgba(30, 58, 138, 0.8)"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200 hover:scale-125 touch-manipulation shadow-lg"
                      onMouseEnter={() => setHoveredDept(dept.id)}
                      onMouseLeave={() => setHoveredDept(null)}
                      onTouchStart={() => setHoveredDept(dept.id)}
                      onTouchEnd={() => setHoveredDept(null)}
                      onClick={() => handleDepartmentClick(dept)}
                      style={{ touchAction: 'manipulation' }}
                    />
                    
                    {/* Destination Name */}
                    <text
                      x={destination.x}
                      y={destination.y + 20}
                      textAnchor="middle"
                      className="fill-white font-semibold pointer-events-none drop-shadow-lg"
                      style={{ fontSize: '10px' }}
                    >
                      {destination.name}
                    </text>
                  </g>
                ))}
                
                {/* Airport Icons for departments with airports */}
                {dept.airports.map((airport, idx) => {
                  const destinations = destinationPositions[dept.id] || []
                  if (destinations.length === 0) return null
                  const mainDot = destinations[0]
                  
                  return (
                    <g key={idx}>
                      <circle
                        cx={mainDot.x + 12}
                        cy={mainDot.y - 12}
                        r="7"
                        fill="rgba(220, 38, 38, 0.9)"
                        stroke="rgba(255, 255, 255, 0.9)"
                        strokeWidth="2"
                        className="pointer-events-none drop-shadow-lg"
                      />
                      <text
                        x={mainDot.x + 12}
                        y={mainDot.y - 7}
                        textAnchor="middle"
                        className="fill-white font-bold pointer-events-none"
                        style={{ fontSize: '9px' }}
                      >
                        ✈
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
        
        {/* Hover Info Box */}
        {hoveredDept && (
          <div className="absolute top-4 left-4 right-4 md:right-4 md:left-auto bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl shadow-2xl p-3 md:p-4 max-w-xs mx-auto md:mx-0 z-10">
            <h3 className="font-semibold text-base md:text-lg mb-2 text-slate-100">{getDepartmentInfo(hoveredDept)?.name}</h3>
            
            {getDepartmentInfo(hoveredDept)?.airports.length! > 0 && (
              <div className="mb-2">
                <p className="text-xs md:text-sm font-medium text-blue-300">Airports:</p>
                {getDepartmentInfo(hoveredDept)?.airports.map((airport, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-slate-300">
                    <Plane className="inline h-3 w-3 mr-1 text-blue-400" />
                    {airport.name} ({airport.code})
                  </p>
                ))}
              </div>
            )}
            
            <div className="mb-2">
              <p className="text-xs md:text-sm font-medium text-blue-300">Destinations:</p>
              <div className="grid grid-cols-1 gap-1">
                {getDepartmentInfo(hoveredDept)?.destinations.slice(0, 3).map((dest, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-slate-300">
                    <MapPin className="inline h-3 w-3 mr-1 text-blue-400" />
                    {dest}
                  </p>
                ))}
                {getDepartmentInfo(hoveredDept)?.destinations.length! > 3 && (
                  <p className="text-xs text-slate-400">+{getDepartmentInfo(hoveredDept)?.destinations.length! - 3} more</p>
                )}
              </div>
            </div>
            
            {getDepartmentInfo(hoveredDept)?.experiences.length! > 0 && (
              <div className="mb-2">
                <p className="text-xs md:text-sm font-medium text-blue-300">Experiences:</p>
                {getDepartmentInfo(hoveredDept)?.experiences.slice(0, 2).map((exp, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-slate-300">• {exp}</p>
                ))}
                {getDepartmentInfo(hoveredDept)?.experiences.length! > 2 && (
                  <p className="text-xs text-slate-400">+{getDepartmentInfo(hoveredDept)?.experiences.length! - 2} more</p>
                )}
              </div>
            )}
            
            <p className="text-xs text-blue-400 font-medium mt-2">Tap to select destinations</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 md:gap-6 justify-center text-xs md:text-sm">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full shadow-lg"></div>
          <span className="text-slate-200">International</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full shadow-lg"></div>
          <span className="text-slate-200">Regional</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-slate-400 rounded-full shadow-lg"></div>
          <span className="text-slate-200">Helipad</span>
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
          <p className="text-sm text-slate-400">Tap departments to select your route</p>
        )}
      </div>
    </div>
  )
}