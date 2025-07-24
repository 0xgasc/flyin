'use client'

import { useState } from 'react'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'
import { MapPin, Plane } from 'lucide-react'

interface GuatemalaMapProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

export default function GuatemalaMap({ 
  onDepartmentClick, 
  selectedFrom, 
  selectedTo,
  mode = 'both' 
}: GuatemalaMapProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null)
  const [selectedDept, setSelectedDept] = useState<string | null>(null)

  const handleDepartmentClick = (dept: Department) => {
    setSelectedDept(dept.id)
    
    // Call the parent component's department click handler
    if (onDepartmentClick) {
      onDepartmentClick(dept)
    }
  }

  const getDepartmentInfo = (deptId: string): Department | undefined => {
    return guatemalaDepartments.find(d => d.id === deptId)
  }

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-xl p-6 shadow-2xl">
        {/* SVG Map */}
        <svg 
          viewBox="0 0 1000 800" 
          className="w-full h-full touch-manipulation filter drop-shadow-lg"
          style={{ 
            maxHeight: '500px',
            minHeight: '300px'
          }}
        >
          {/* Clean Guatemala Silhouette - v2 matching FlyIn Guatemala design */}
          <path
            d="M150 150 L200 120 L300 100 L450 80 L600 75 L750 80 L850 100 L900 130 L950 170 L980 220 L990 280 L980 340 L960 400 L930 450 L890 490 L840 520 L780 540 L710 550 L640 555 L570 550 L500 540 L430 525 L370 505 L320 480 L280 450 L250 415 L230 375 L220 335 L215 295 L220 255 L230 215 L250 180 L280 150 L320 130 L370 115 L430 105 L500 100 L570 105 L640 115 L710 130 L780 150 L840 175 L890 205 L930 240 L960 280 L980 325 L990 370 L980 415 L960 460 L930 500 L890 535 L840 565 L780 590 L710 610 L640 625 L570 635 L500 640 L430 635 L370 625 L320 610 L280 590 L250 565 L230 535 L220 500 L215 460 L220 415 L230 370 L250 325 L280 280 L320 240 L370 205 L430 175 Z"
            fill="rgba(59, 130, 246, 0.15)"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="2"
            className="pointer-events-none"
          />
          
          {/* Clean Destination Dots - matching your FlyIn Guatemala map */}
          {guatemalaDepartments.map((dept) => {
            // Position dots based on your reference map
            const getDestinationDots = (id: string) => {
              const positions: Record<string, Array<{name: string, x: number, y: number}>> = {
                'peten': [
                  { name: 'Tikal', x: 750, y: 150 },
                  { name: 'Flores', x: 700, y: 200 },
                  { name: 'El Mirador', x: 800, y: 100 }
                ],
                'izabal': [
                  { name: 'Río Dulce', x: 850, y: 320 },
                  { name: 'Livingston', x: 920, y: 340 },
                  { name: 'Puerto Barrios', x: 950, y: 380 }
                ],
                'alta-verapaz': [
                  { name: 'Cobán', x: 600, y: 300 },
                  { name: 'Sayaxché', x: 550, y: 250 }
                ],
                'baja-verapaz': [
                  { name: 'Rabinal', x: 500, y: 380 }
                ],
                'zacapa': [
                  { name: 'Zacapa', x: 750, y: 450 }
                ],
                'chiquimula': [
                  { name: 'Chiquimula', x: 800, y: 500 },
                  { name: 'Esquipulas', x: 850, y: 520 }
                ],
                'jalapa': [
                  { name: 'Jalapa', x: 650, y: 500 }
                ],
                'el-progreso': [
                  { name: 'El Progreso', x: 550, y: 420 }
                ],
                'guatemala': [
                  { name: 'Ciudad de Guatemala', x: 500, y: 500 }
                ],
                'sacatepequez': [
                  { name: 'Antigua', x: 450, y: 520 }
                ],
                'chimaltenango': [
                  { name: 'Chimaltenango', x: 420, y: 480 }
                ],
                'escuintla': [
                  { name: 'Monterrico', x: 450, y: 600 },
                  { name: 'San José', x: 380, y: 620 }
                ],
                'santa-rosa': [
                  { name: 'Santa Rosa', x: 550, y: 560 }
                ],
                'jutiapa': [
                  { name: 'Jutiapa', x: 650, y: 580 }
                ],
                'huehuetenango': [
                  { name: 'Huehuetenango', x: 200, y: 280 },
                  { name: 'Nebaj', x: 280, y: 320 }
                ],
                'quiche': [
                  { name: 'Quiché', x: 350, y: 380 }
                ],
                'san-marcos': [
                  { name: 'San Marcos', x: 150, y: 450 }
                ],
                'quetzaltenango': [
                  { name: 'Xela', x: 250, y: 450 }
                ],
                'totonicapan': [
                  { name: 'Totonicapán', x: 320, y: 420 }
                ],
                'solola': [
                  { name: 'Atitlán', x: 300, y: 480 }
                ],
                'suchitepequez': [
                  { name: 'Mazatenango', x: 280, y: 550 }
                ],
                'retalhuleu': [
                  { name: 'Retalhuleu', x: 220, y: 580 }
                ]
              }
              return positions[id] || []
            }

            return (
              <g key={dept.id}>
                {/* Destination Dots */}
                {getDestinationDots(dept.id).map((destination, idx) => (
                  <g key={idx}>
                    <circle
                      cx={destination.x}
                      cy={destination.y}
                      r="6"
                      fill="rgba(30, 41, 59, 0.9)"
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth="2"
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
                      y={destination.y + 25}
                      textAnchor="middle"
                      className="fill-slate-200 font-medium pointer-events-none drop-shadow-lg"
                      style={{ fontSize: '11px' }}
                    >
                      {destination.name}
                    </text>
                  </g>
                ))}
                
                {/* Airport Icons for departments with airports */}
                {dept.airports.map((airport, idx) => {
                  const dots = getDestinationDots(dept.id)
                  if (dots.length === 0) return null
                  const mainDot = dots[0] // Use first destination as reference
                  
                  return (
                    <g key={idx}>
                      <circle
                        cx={mainDot.x + 15}
                        cy={mainDot.y - 15}
                        r="8"
                        fill="rgba(59, 130, 246, 0.9)"
                        stroke="rgba(255, 255, 255, 0.9)"
                        strokeWidth="2"
                        className="pointer-events-none drop-shadow-lg"
                      />
                      <text
                        x={mainDot.x + 15}
                        y={mainDot.y - 10}
                        textAnchor="middle"
                        className="fill-white font-bold pointer-events-none"
                        style={{ fontSize: '10px' }}
                      >
                        ✈
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
          
          {/* Connection Line Between Selected Points */}
          {selectedFrom && selectedTo && (
            <line
              x1={50 + ((guatemalaDepartments.find(d => d.destinations.includes(selectedFrom))?.coordinates[1] || 0 + 92.3) / 4.5) * 400}
              y1={350 - ((guatemalaDepartments.find(d => d.destinations.includes(selectedFrom))?.coordinates[0] || 0 - 13.5) / 4.0) * 300}
              x2={50 + ((guatemalaDepartments.find(d => d.destinations.includes(selectedTo))?.coordinates[1] || 0 + 92.3) / 4.5) * 400}
              y2={350 - ((guatemalaDepartments.find(d => d.destinations.includes(selectedTo))?.coordinates[0] || 0 - 13.5) / 4.0) * 300}
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          )}
        </svg>
        
        {/* Hover/Touch Info Box */}
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
