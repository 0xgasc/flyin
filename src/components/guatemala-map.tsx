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
          viewBox="0 0 400 300" 
          className="w-full h-full touch-manipulation"
          style={{ 
            maxHeight: '500px',
            minHeight: '300px'
          }}
        >
          {/* Guatemala Map Paths - Simplified representation */}
          {guatemalaDepartments.map((dept) => (
            <g key={dept.id}>
              {/* Department Circle (simplified - in production, use actual polygon paths) */}
              <circle
                cx={20 + (dept.coordinates[1] + 92.5) * 15}
                cy={280 - (dept.coordinates[0] - 13) * 25}
                r="18"
                fill={dept.color}
                fillOpacity={
                  hoveredDept === dept.id ? 0.8 : 
                  selectedFrom === dept.destinations[0] || selectedTo === dept.destinations[0] ? 0.7 : 
                  0.5
                }
                stroke="#fff"
                strokeWidth="3"
                className="cursor-pointer transition-all duration-200 hover:scale-110 active:scale-125 touch-manipulation"
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
                  <text
                    x={20 + (dept.coordinates[1] + 92.5) * 15}
                    y={280 - (dept.coordinates[0] - 13) * 25 + 3}
                    textAnchor="middle"
                    className="fill-white font-bold text-xs pointer-events-none"
                  >
                    ✈️
                  </text>
                </g>
              ))}
              
              {/* Department Name */}
              <text
                x={20 + (dept.coordinates[1] + 92.5) * 15}
                y={280 - (dept.coordinates[0] - 13) * 25 + 30}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-medium pointer-events-none"
              >
                {dept.name}
              </text>
            </g>
          ))}
          
          {/* Connection Line Between Selected Points */}
          {selectedFrom && selectedTo && (
            <line
              x1={20 + (guatemalaDepartments.find(d => d.destinations.includes(selectedFrom))?.coordinates[1] || 0 + 92.5) * 15}
              y1={280 - (guatemalaDepartments.find(d => d.destinations.includes(selectedFrom))?.coordinates[0] || 0 - 13) * 25}
              x2={20 + (guatemalaDepartments.find(d => d.destinations.includes(selectedTo))?.coordinates[1] || 0 + 92.5) * 15}
              y2={280 - (guatemalaDepartments.find(d => d.destinations.includes(selectedTo))?.coordinates[0] || 0 - 13) * 25}
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