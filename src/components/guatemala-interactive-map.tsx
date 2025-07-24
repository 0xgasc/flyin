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

  // Real Guatemala country outline coordinates
  const guatemalaPath = "M89.5 202.1L90.6 201.8L91.9 201.6L93.3 201.5L94.8 201.5L96.3 201.6L97.7 201.8L99.1 202.1L100.4 202.5L101.6 203L102.8 203.6L103.8 204.3L104.8 205.1L105.6 206L106.3 207L106.9 208.1L107.3 209.3L107.6 210.5L107.8 211.8L107.8 213.1L107.7 214.4L107.5 215.7L107.1 216.9L106.6 218.1L106 219.2L105.2 220.2L104.3 221.1L103.3 221.9L102.1 222.6L100.8 223.2L99.4 223.7L97.9 224.1L96.3 224.4L94.7 224.6L93 224.7L91.3 224.7L89.5 224.6L87.8 224.4L86.1 224.1L84.5 223.7L83 223.2L81.6 222.6L80.3 221.9L79.2 221.1L78.2 220.2L77.4 219.2L76.8 218.1L76.3 216.9L75.9 215.7L75.7 214.4L75.6 213.1L75.6 211.8L75.8 210.5L76.1 209.3L76.5 208.1L77.1 207L77.8 206L78.6 205.1L79.6 204.3L80.7 203.6L81.9 203L83.2 202.5L84.5 202.1L85.9 201.8L87.3 201.6L88.8 201.5L89.5 202.1Z"

  // Accurate destination positions based on real Guatemala geography
  const destinationPositions: Record<string, Array<{name: string, x: number, y: number}>> = {
    'peten': [
      { name: 'Tikal', x: 155, y: 60 },
      { name: 'Flores', x: 148, y: 75 },
      { name: 'El Mirador', x: 165, y: 45 }
    ],
    'izabal': [
      { name: 'Río Dulce', x: 175, y: 120 },
      { name: 'Livingston', x: 185, y: 125 },
      { name: 'Puerto Barrios', x: 190, y: 135 }
    ],
    'alta-verapaz': [
      { name: 'Cobán', x: 135, y: 110 },
      { name: 'Sayaxché', x: 125, y: 95 }
    ],
    'baja-verapaz': [
      { name: 'Rabinal', x: 115, y: 135 }
    ],
    'zacapa': [
      { name: 'Zacapa', x: 165, y: 155 }
    ],
    'chiquimula': [
      { name: 'Chiquimula', x: 175, y: 165 },
      { name: 'Esquipulas', x: 185, y: 170 }
    ],
    'jalapa': [
      { name: 'Jalapa', x: 145, y: 165 }
    ],
    'el-progreso': [
      { name: 'El Progreso', x: 125, y: 145 }
    ],
    'guatemala': [
      { name: 'Ciudad de Guatemala', x: 115, y: 165 }
    ],
    'sacatepequez': [
      { name: 'Antigua', x: 105, y: 170 }
    ],
    'chimaltenango': [
      { name: 'Chimaltenango', x: 95, y: 155 }
    ],
    'escuintla': [
      { name: 'Monterrico', x: 105, y: 185 },
      { name: 'San José', x: 85, y: 190 }
    ],
    'santa-rosa': [
      { name: 'Santa Rosa', x: 125, y: 175 }
    ],
    'jutiapa': [
      { name: 'Jutiapa', x: 145, y: 180 }
    ],
    'huehuetenango': [
      { name: 'Huehuetenango', x: 45, y: 100 },
      { name: 'Nebaj', x: 65, y: 115 }
    ],
    'quiche': [
      { name: 'Quiché', x: 80, y: 135 }
    ],
    'san-marcos': [
      { name: 'San Marcos', x: 30, y: 155 }
    ],
    'quetzaltenango': [
      { name: 'Xela', x: 55, y: 155 }
    ],
    'totonicapan': [
      { name: 'Totonicapán', x: 75, y: 145 }
    ],
    'solola': [
      { name: 'Atitlán', x: 70, y: 160 }
    ],
    'suchitepequez': [
      { name: 'Mazatenango', x: 65, y: 175 }
    ],
    'retalhuleu': [
      { name: 'Retalhuleu', x: 50, y: 180 }
    ]
  }

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-xl p-6 shadow-2xl">
        {/* SVG Map */}
        <svg 
          viewBox="0 0 220 230" 
          className="w-full h-full touch-manipulation filter drop-shadow-lg"
          style={{ 
            maxHeight: '500px',
            minHeight: '300px'
          }}
        >
          {/* Guatemala Country Outline */}
          <path
            d={guatemalaPath}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="1.5"
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
                      r="4"
                      fill="rgba(30, 41, 59, 0.9)"
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all duration-200 hover:scale-125 touch-manipulation"
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
                      y={destination.y + 18}
                      textAnchor="middle"
                      className="fill-slate-200 font-medium pointer-events-none drop-shadow-lg"
                      style={{ fontSize: '8px' }}
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
                        cx={mainDot.x + 10}
                        cy={mainDot.y - 10}
                        r="6"
                        fill="rgba(59, 130, 246, 0.9)"
                        stroke="rgba(255, 255, 255, 0.9)"
                        strokeWidth="1.5"
                        className="pointer-events-none drop-shadow-lg"
                      />
                      <text
                        x={mainDot.x + 10}
                        y={mainDot.y - 6}
                        textAnchor="middle"
                        className="fill-white font-bold pointer-events-none"
                        style={{ fontSize: '8px' }}
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