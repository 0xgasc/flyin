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
          viewBox="0 0 800 600" 
          className="w-full h-full"
          style={{ maxHeight: '500px' }}
        >
          {/* Guatemala Map Paths - Simplified representation */}
          {guatemalaDepartments.map((dept) => (
            <g key={dept.id}>
              {/* Department Circle (simplified - in production, use actual polygon paths) */}
              <circle
                cx={100 + (dept.coordinates[1] + 92) * 8}
                cy={500 - (dept.coordinates[0] - 13.5) * 20}
                r="25"
                fill={dept.color}
                fillOpacity={
                  hoveredDept === dept.id ? 0.8 : 
                  selectedFrom === dept.destinations[0] || selectedTo === dept.destinations[0] ? 0.7 : 
                  0.5
                }
                stroke="#fff"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:scale-110"
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={() => handleDepartmentClick(dept)}
              />
              
              {/* Airport Icons */}
              {dept.airports.map((airport, idx) => (
                <g key={idx}>
                  <text
                    x={100 + (dept.coordinates[1] + 92) * 8}
                    y={500 - (dept.coordinates[0] - 13.5) * 20 + 5}
                    textAnchor="middle"
                    className="fill-white font-bold text-xs pointer-events-none"
                  >
                    ✈️
                  </text>
                </g>
              ))}
              
              {/* Department Name */}
              <text
                x={100 + (dept.coordinates[1] + 92) * 8}
                y={500 - (dept.coordinates[0] - 13.5) * 20 + 35}
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
              x1={100 + (guatemalaDepartments.find(d => d.destinations.includes(selectedFrom))?.coordinates[1] || 0 + 92) * 8}
              y1={500 - (guatemalaDepartments.find(d => d.destinations.includes(selectedFrom))?.coordinates[0] || 0 - 13.5) * 20}
              x2={100 + (guatemalaDepartments.find(d => d.destinations.includes(selectedTo))?.coordinates[1] || 0 + 92) * 8}
              y2={500 - (guatemalaDepartments.find(d => d.destinations.includes(selectedTo))?.coordinates[0] || 0 - 13.5) * 20}
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          )}
        </svg>
        
        {/* Hover Info Box */}
        {hoveredDept && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <h3 className="font-semibold text-lg mb-2">{getDepartmentInfo(hoveredDept)?.name}</h3>
            
            {getDepartmentInfo(hoveredDept)?.airports.length! > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700">Airports:</p>
                {getDepartmentInfo(hoveredDept)?.airports.map((airport, idx) => (
                  <p key={idx} className="text-sm text-gray-600">
                    <Plane className="inline h-3 w-3 mr-1" />
                    {airport.name} ({airport.code})
                  </p>
                ))}
              </div>
            )}
            
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-700">Destinations:</p>
              {getDepartmentInfo(hoveredDept)?.destinations.map((dest, idx) => (
                <p key={idx} className="text-sm text-gray-600">
                  <MapPin className="inline h-3 w-3 mr-1" />
                  {dest}
                </p>
              ))}
            </div>
            
            {getDepartmentInfo(hoveredDept)?.experiences.length! > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700">Popular Experiences:</p>
                {getDepartmentInfo(hoveredDept)?.experiences.slice(0, 3).map((exp, idx) => (
                  <p key={idx} className="text-sm text-gray-600">• {exp}</p>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">Click to select</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm">International Airport</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Regional Airport</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-sm">No Airport (Helipad/Landing)</span>
        </div>
      </div>
      
      {/* Selection Status */}
      <div className="mt-4 text-center">
        {selectedFrom && (
          <p className="text-sm text-gray-600">
            From: <span className="font-semibold">{selectedFrom}</span>
          </p>
        )}
        {selectedTo && (
          <p className="text-sm text-gray-600">
            To: <span className="font-semibold">{selectedTo}</span>
          </p>
        )}
      </div>
    </div>
  )
}