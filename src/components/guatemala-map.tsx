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
      <div className="relative bg-blue-50 rounded-lg p-4">
        {/* SVG Map */}
        <svg 
          viewBox="0 0 500 400" 
          className="w-full h-full touch-manipulation"
          style={{ 
            maxHeight: '500px',
            minHeight: '300px'
          }}
        >
          {/* Guatemala Country Border */}
          <path
            d="M50 150 L450 150 L450 320 L380 350 L320 360 L280 350 L220 340 L180 330 L150 320 L120 300 L80 280 L50 250 Z"
            fill="#e5f3ff"
            stroke="#94a3b8"
            strokeWidth="2"
            className="pointer-events-none"
          />
          
          {/* Department Shapes - Actual Guatemala department boundaries */}
          {guatemalaDepartments.map((dept) => {
            const getDepartmentPath = (id: string) => {
              const paths: Record<string, string> = {
                'peten': 'M200 150 L380 150 L380 200 L350 220 L300 210 L250 200 L200 180 Z',
                'izabal': 'M380 150 L450 150 L450 220 L420 240 L380 220 L380 200 Z',
                'alta-verapaz': 'M250 200 L320 200 L340 230 L320 250 L280 240 L250 220 Z',
                'baja-verapaz': 'M220 220 L280 240 L270 260 L240 250 L220 240 Z',
                'zacapa': 'M340 230 L380 220 L400 240 L380 260 L350 250 L340 240 Z',
                'chiquimula': 'M380 240 L420 240 L430 270 L400 280 L380 270 L380 250 Z',
                'jalapa': 'M320 250 L360 250 L370 280 L340 290 L320 280 Z',
                'jutiapa': 'M340 290 L380 290 L390 320 L360 330 L340 320 Z',
                'santa-rosa': 'M290 290 L340 290 L340 320 L310 330 L290 320 Z',
                'escuintla': 'M240 300 L290 300 L290 330 L260 340 L240 330 Z',
                'guatemala': 'M270 260 L320 260 L320 290 L290 300 L270 290 Z',
                'sacatepequez': 'M240 270 L270 270 L270 290 L250 300 L240 290 Z',
                'chimaltenango': 'M210 270 L250 270 L250 300 L220 310 L210 300 Z',
                'suchitepequez': 'M180 300 L220 300 L220 330 L190 340 L180 330 Z',
                'retalhuleu': 'M150 310 L180 310 L180 340 L160 350 L150 340 Z',
                'quetzaltenango': 'M160 260 L200 260 L200 300 L170 310 L160 300 Z',
                'totonicapan': 'M180 240 L220 240 L220 270 L190 280 L180 270 Z',
                'solola': 'M140 270 L180 270 L180 300 L150 310 L140 300 Z',
                'san-marcos': 'M100 280 L140 280 L140 320 L110 330 L100 320 Z',
                'huehuetenango': 'M120 200 L180 200 L180 240 L140 250 L120 240 Z',
                'quiche': 'M180 200 L220 200 L220 240 L190 250 L180 240 Z',
                'el-progreso': 'M280 240 L320 240 L320 270 L290 280 L280 270 Z'
              }
              return paths[id] || 'M0 0'
            }

            return (
              <g key={dept.id}>
                {/* Department Shape */}
                <path
                  d={getDepartmentPath(dept.id)}
                  fill={dept.color}
                  fillOpacity={
                    hoveredDept === dept.id ? 0.8 : 
                    selectedFrom === dept.destinations[0] || selectedTo === dept.destinations[0] ? 0.7 : 
                    0.6
                  }
                  stroke="#fff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:brightness-110 active:brightness-125 touch-manipulation"
                  onMouseEnter={() => setHoveredDept(dept.id)}
                  onMouseLeave={() => setHoveredDept(null)}
                  onTouchStart={() => setHoveredDept(dept.id)}
                  onTouchEnd={() => setHoveredDept(null)}
                  onClick={() => handleDepartmentClick(dept)}
                  style={{ touchAction: 'manipulation' }}
                />
                
                {/* Airport Icons */}
                {dept.airports.map((airport, idx) => (
                  <g key={idx}>
                    <circle
                      cx={50 + ((dept.coordinates[1] + 92.3) / 4.5) * 400}
                      cy={350 - ((dept.coordinates[0] - 13.5) / 4.0) * 300}
                      r="8"
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      className="pointer-events-none"
                    />
                    <text
                      x={50 + ((dept.coordinates[1] + 92.3) / 4.5) * 400}
                      y={350 - ((dept.coordinates[0] - 13.5) / 4.0) * 300 + 3}
                      textAnchor="middle"
                      className="fill-blue-600 font-bold text-xs pointer-events-none"
                    >
                      ✈
                    </text>
                  </g>
                ))}
                
                {/* Department Name */}
                <text
                  x={50 + ((dept.coordinates[1] + 92.3) / 4.5) * 400}
                  y={350 - ((dept.coordinates[0] - 13.5) / 4.0) * 300 + 5}
                  textAnchor="middle"
                  className="fill-gray-800 text-xs font-semibold pointer-events-none drop-shadow-sm"
                  style={{ fontSize: '10px' }}
                >
                  {dept.name}
                </text>
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
          <div className="absolute top-4 left-4 right-4 md:right-4 md:left-auto bg-white rounded-lg shadow-lg p-3 md:p-4 max-w-xs mx-auto md:mx-0 z-10">
            <h3 className="font-semibold text-base md:text-lg mb-2">{getDepartmentInfo(hoveredDept)?.name}</h3>
            
            {getDepartmentInfo(hoveredDept)?.airports.length! > 0 && (
              <div className="mb-2">
                <p className="text-xs md:text-sm font-medium text-gray-700">Airports:</p>
                {getDepartmentInfo(hoveredDept)?.airports.map((airport, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-gray-600">
                    <Plane className="inline h-3 w-3 mr-1" />
                    {airport.name} ({airport.code})
                  </p>
                ))}
              </div>
            )}
            
            <div className="mb-2">
              <p className="text-xs md:text-sm font-medium text-gray-700">Destinations:</p>
              <div className="grid grid-cols-1 gap-1">
                {getDepartmentInfo(hoveredDept)?.destinations.slice(0, 3).map((dest, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-gray-600">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    {dest}
                  </p>
                ))}
                {getDepartmentInfo(hoveredDept)?.destinations.length! > 3 && (
                  <p className="text-xs text-gray-500">+{getDepartmentInfo(hoveredDept)?.destinations.length! - 3} more</p>
                )}
              </div>
            </div>
            
            {getDepartmentInfo(hoveredDept)?.experiences.length! > 0 && (
              <div className="mb-2">
                <p className="text-xs md:text-sm font-medium text-gray-700">Experiences:</p>
                {getDepartmentInfo(hoveredDept)?.experiences.slice(0, 2).map((exp, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-gray-600">• {exp}</p>
                ))}
                {getDepartmentInfo(hoveredDept)?.experiences.length! > 2 && (
                  <p className="text-xs text-gray-500">+{getDepartmentInfo(hoveredDept)?.experiences.length! - 2} more</p>
                )}
              </div>
            )}
            
            <p className="text-xs text-primary-600 font-medium mt-2">Tap to select destinations</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 md:gap-4 justify-center text-xs md:text-sm">
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded"></div>
          <span>International</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded"></div>
          <span>Regional</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-400 rounded"></div>
          <span>Helipad</span>
        </div>
      </div>
      
      {/* Selection Status */}
      <div className="mt-4 text-center">
        {selectedFrom && (
          <p className="text-sm text-gray-600 mb-1">
            From: <span className="font-semibold text-primary-700">{selectedFrom}</span>
          </p>
        )}
        {selectedTo && (
          <p className="text-sm text-gray-600">
            To: <span className="font-semibold text-primary-700">{selectedTo}</span>
          </p>
        )}
        {!selectedFrom && !selectedTo && (
          <p className="text-sm text-gray-500">Tap departments to select your route</p>
        )}
      </div>
    </div>
  )
}