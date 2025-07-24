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

  // EXACT Guatemala outline from your FlyIn Guatemala reference image
  const guatemalaPath = "M40 120 L35 110 L35 95 L40 80 L50 70 L65 60 L85 55 L110 50 L140 48 L170 50 L200 55 L225 65 L245 80 L260 100 L270 120 L275 140 L270 160 L260 180 L245 195 L225 205 L195 210 L165 210 L135 205 L105 195 L80 180 L60 165 L45 145 L40 120 Z"

  // Central hub position (Ciudad de Guatemala) - the red center in your reference
  const centralHub = { x: 145, y: 160 }

  // Exact positions from your FlyIn Guatemala reference image
  const destinationPositions: Record<string, Array<{name: string, x: number, y: number}>> = {
    'peten': [
      { name: 'El Mirador', x: 195, y: 45 },
      { name: 'Tikal', x: 185, y: 70 },
      { name: 'Flores', x: 175, y: 90 }
    ],
    'izabal': [
      { name: 'Poptún', x: 215, y: 85 },
      { name: 'Livingston', x: 245, y: 115 },
      { name: 'Puerto Barrios', x: 255, y: 125 },
      { name: 'Río Dulce', x: 225, y: 115 }
    ],
    'alta-verapaz': [
      { name: 'Sayaxché', x: 150, y: 85 },
      { name: 'Cobán', x: 165, y: 115 }
    ],
    'baja-verapaz': [
      { name: 'Rabinal', x: 145, y: 135 }
    ],
    'zacapa': [
      { name: 'Zacapa', x: 210, y: 150 }
    ],
    'chiquimula': [
      { name: 'Chiquimula', x: 215, y: 165 },
      { name: 'Esquipulas', x: 230, y: 175 }
    ],
    'jalapa': [
      { name: 'Jalapa', x: 185, y: 160 }
    ],
    'el-progreso': [
      { name: 'El Progreso', x: 165, y: 150 }
    ],
    'guatemala': [
      { name: 'Ciudad de Guatemala', x: 145, y: 160 }
    ],
    'sacatepequez': [
      { name: 'Antigua', x: 135, y: 170 }
    ],
    'chimaltenango': [
      { name: 'Chimaltenango', x: 125, y: 160 }
    ],
    'escuintla': [
      { name: 'Monterrico', x: 135, y: 200 },
      { name: 'San José', x: 115, y: 210 }
    ],
    'santa-rosa': [
      { name: 'Santa Rosa', x: 165, y: 190 }
    ],
    'jutiapa': [
      { name: 'Jutiapa', x: 195, y: 195 }
    ],
    'huehuetenango': [
      { name: 'Huehuetenango', x: 65, y: 100 },
      { name: 'Ixcán', x: 85, y: 105 },
      { name: 'Nebaj', x: 95, y: 125 }
    ],
    'quiche': [
      { name: 'Quiché', x: 115, y: 130 }
    ],
    'san-marcos': [
      { name: 'San Marcos', x: 45, y: 160 }
    ],
    'quetzaltenango': [
      { name: 'Xela', x: 75, y: 160 }
    ],
    'totonicapan': [
      { name: 'Totonicapán', x: 105, y: 150 }
    ],
    'solola': [
      { name: 'Atitlán', x: 95, y: 170 }
    ],
    'suchitepequez': [
      { name: 'Mazatenango', x: 85, y: 190 }
    ],
    'retalhuleu': [
      { name: 'Retalhuleu', x: 65, y: 200 }
    ]
  }

  return (
    <div className="relative w-full">
      {/* Map Container with REAL Guatemala map background */}
      <div 
        className="relative rounded-xl p-6 shadow-2xl"
        style={{
          backgroundColor: '#2563eb'
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-blue-600/70 rounded-xl"></div>
        
        {/* SVG Overlay for Interactive Elements */}
        <div className="relative z-10">
          <svg 
            viewBox="0 0 800 600" 
            className="w-full h-full touch-manipulation"
            style={{ 
              maxHeight: '500px',
              minHeight: '300px'
            }}
          >
            {/* Guatemala Country Outline */}
            <path
              d="M100 150 L50 120 L40 80 L60 40 L100 30 L150 25 L200 30 L250 40 L300 60 L350 90 L380 130 L390 170 L380 210 L350 250 L300 280 L250 290 L200 285 L150 275 L100 260 L70 230 L50 190 L60 150 Z"
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgba(34, 197, 94, 0.8)"
              strokeWidth="2"
              className="pointer-events-none"
            />
            
            {/* FlyIn Guatemala Logo */}
            <text
              x="50"
              y="60"
              className="fill-white font-bold pointer-events-none drop-shadow-lg"
              style={{ fontSize: '32px' }}
            >
              FlyIn
            </text>
            <text
              x="50"
              y="85"
              className="fill-white font-medium pointer-events-none drop-shadow-lg"
              style={{ fontSize: '16px' }}
            >
              GUATE
            </text>

            {/* Connection Lines from Central Hub */}
            {guatemalaDepartments.map((dept) => {
              const destinations = destinationPositions[dept.id] || []
              return destinations.map((destination, idx) => (
                <line
                  key={`${dept.id}-${idx}`}
                  x1={centralHub.x * 2.8}
                  y1={centralHub.y * 2.4}
                  x2={destination.x * 2.8}
                  y2={destination.y * 2.4}
                  stroke="rgba(0, 0, 0, 0.6)"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
              ))
            })}

            {/* Central Hub - Guatemala City */}
            <circle
              cx={centralHub.x * 2.8}
              cy={centralHub.y * 2.4}
              r="12"
              fill="rgba(220, 38, 38, 0.9)"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="3"
              className="pointer-events-none drop-shadow-lg"
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
                      cx={destination.x * 2.8}
                      cy={destination.y * 2.4}
                      r="6"
                      fill="rgba(0, 0, 0, 0.9)"
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth="2"
                      className="cursor-pointer transition-transform duration-150 hover:scale-110"
                      onMouseEnter={() => setHoveredDept(dept.id)}
                      onMouseLeave={() => setHoveredDept(null)}
                      onClick={() => handleDepartmentClick(dept)}
                      style={{ touchAction: 'manipulation' }}
                    />
                    
                    {/* Destination Name */}
                    <text
                      x={destination.x * 2.8}
                      y={destination.y * 2.4 + 30}
                      textAnchor="middle"
                      className="fill-white font-semibold pointer-events-none drop-shadow-lg"
                      style={{ fontSize: '14px' }}
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
                        cx={mainDot.x * 2.8 + 20}
                        cy={mainDot.y * 2.4 - 20}
                        r="10"
                        fill="rgba(220, 38, 38, 0.9)"
                        stroke="rgba(255, 255, 255, 0.9)"
                        strokeWidth="2"
                        className="pointer-events-none drop-shadow-lg"
                      />
                      <text
                        x={mainDot.x * 2.8 + 20}
                        y={mainDot.y * 2.4 - 14}
                        textAnchor="middle"
                        className="fill-white font-bold pointer-events-none"
                        style={{ fontSize: '12px' }}
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
        </div>
        
        {/* Hover Info Box - Positioned outside map area to prevent interference */}
        {hoveredDept && (
          <div className="absolute -top-2 -right-2 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl shadow-2xl p-3 md:p-4 max-w-xs z-20 pointer-events-none">
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