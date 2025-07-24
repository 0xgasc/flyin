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
          viewBox="0 0 600 450" 
          className="w-full h-full touch-manipulation filter drop-shadow-lg"
          style={{ 
            maxHeight: '500px',
            minHeight: '300px'
          }}
        >
          {/* Guatemala Country Silhouette - Accurate shape */}
          <path
            d="M50 200 L80 180 L120 160 L180 150 L250 140 L320 135 L380 140 L420 145 L460 155 L500 170 L520 190 L540 210 L550 240 L545 270 L535 300 L520 320 L500 340 L475 355 L445 365 L410 370 L375 365 L340 355 L305 345 L270 335 L235 325 L200 315 L170 300 L145 285 L125 265 L110 245 L100 225 L95 205 L85 185 L75 175 L65 185 L55 195 Z"
            fill="rgba(30, 41, 59, 0.3)"
            stroke="rgba(148, 163, 184, 0.5)"
            strokeWidth="1"
            className="pointer-events-none"
          />
          
          {/* Department Shapes - Accurate Guatemala department boundaries */}
          {guatemalaDepartments.map((dept) => {
            const getDepartmentPath = (id: string) => {
              const paths: Record<string, string> = {
                // Northern departments
                'peten': 'M180 150 L320 135 L380 140 L420 145 L460 155 L500 170 L520 190 L540 210 L530 230 L510 240 L480 245 L450 240 L420 235 L390 230 L360 225 L330 220 L300 215 L270 210 L240 205 L210 200 L180 195 L160 175 L170 160 Z',
                
                // Eastern departments  
                'izabal': 'M480 245 L520 190 L540 210 L550 240 L545 270 L525 285 L505 290 L485 285 L470 275 L460 260 L465 250 Z',
                'zacapa': 'M420 235 L450 240 L470 255 L460 275 L445 285 L425 280 L410 270 L405 255 L415 245 Z',
                'chiquimula': 'M445 285 L470 275 L485 285 L490 300 L480 315 L465 320 L450 315 L440 305 L435 295 Z',
                'jalapa': 'M405 270 L425 280 L435 295 L425 305 L410 310 L395 305 L385 295 L390 280 Z',
                'el-progreso': 'M360 225 L390 230 L405 245 L395 260 L380 265 L365 260 L355 250 L350 235 Z',
                
                // Central departments
                'guatemala': 'M330 250 L360 255 L365 270 L355 285 L340 290 L325 285 L315 275 L320 260 Z',
                'sacatepequez': 'M315 275 L340 280 L335 295 L325 300 L310 295 L305 285 L310 280 Z',
                'chimaltenango': 'M290 270 L315 275 L310 290 L295 295 L280 290 L275 280 L285 275 Z',
                'escuintla': 'M280 290 L305 295 L310 310 L295 320 L275 315 L260 310 L265 300 Z',
                'santa-rosa': 'M325 300 L350 305 L355 320 L340 330 L320 325 L305 320 L315 310 Z',
                'jutiapa': 'M355 320 L380 325 L385 340 L370 350 L350 345 L335 340 L345 330 Z',
                
                // Verapaces
                'alta-verapaz': 'M300 215 L360 225 L355 250 L340 265 L320 270 L300 265 L285 255 L290 240 L295 225 Z',
                'baja-verapaz': 'M285 255 L320 270 L315 285 L300 290 L280 285 L270 275 L275 265 Z',
                
                // Western departments
                'huehuetenango': 'M80 180 L120 160 L160 175 L180 195 L175 215 L165 235 L150 245 L130 240 L110 230 L95 215 L85 195 Z',
                'quiche': 'M160 175 L210 200 L240 205 L235 225 L220 240 L200 245 L180 240 L165 235 L170 220 L175 200 Z',
                'san-marcos': 'M75 175 L110 230 L120 250 L105 265 L85 270 L65 265 L50 255 L55 240 L60 225 L65 210 L70 195 Z',
                'quetzaltenango': 'M130 240 L165 235 L180 240 L175 255 L160 270 L145 275 L125 270 L115 260 L120 250 Z',
                'totonicapan': 'M165 235 L200 245 L195 260 L180 275 L160 270 L150 260 L155 250 Z',
                'solola': 'M125 270 L160 270 L155 285 L140 300 L120 295 L105 285 L110 275 Z',
                'suchitepequez': 'M160 270 L195 275 L190 295 L175 310 L155 305 L140 300 L145 285 Z',
                'retalhuleu': 'M120 295 L155 305 L150 320 L135 330 L115 325 L100 315 L105 305 Z'
              }
              return paths[id] || 'M0 0'
            }

            return (
              <g key={dept.id}>
                {/* Department Shape */}
                <path
                  d={getDepartmentPath(dept.id)}
                  fill={
                    hoveredDept === dept.id ? 'rgba(59, 130, 246, 0.8)' :
                    selectedFrom === dept.destinations[0] || selectedTo === dept.destinations[0] ? 'rgba(37, 99, 235, 0.7)' : 
                    'rgba(71, 85, 105, 0.6)'
                  }
                  stroke={hoveredDept === dept.id ? '#3b82f6' : 'rgba(148, 163, 184, 0.8)'}
                  strokeWidth={hoveredDept === dept.id ? "2" : "1"}
                  className="cursor-pointer transition-all duration-300 ease-in-out hover:drop-shadow-lg touch-manipulation"
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
                      cx={50 + ((dept.coordinates[1] + 92.3) / 4.5) * 500}
                      cy={400 - ((dept.coordinates[0] - 13.5) / 4.0) * 350}
                      r="6"
                      fill="rgba(59, 130, 246, 0.9)"
                      stroke="rgba(255, 255, 255, 0.8)"
                      strokeWidth="1.5"
                      className="pointer-events-none drop-shadow-sm"
                    />
                    <text
                      x={50 + ((dept.coordinates[1] + 92.3) / 4.5) * 500}
                      y={400 - ((dept.coordinates[0] - 13.5) / 4.0) * 350 + 2}
                      textAnchor="middle"
                      className="fill-white font-bold pointer-events-none"
                      style={{ fontSize: '8px' }}
                    >
                      ✈
                    </text>
                  </g>
                ))}
                
                {/* Department Name */}
                <text
                  x={50 + ((dept.coordinates[1] + 92.3) / 4.5) * 500}
                  y={400 - ((dept.coordinates[0] - 13.5) / 4.0) * 350 + 25}
                  textAnchor="middle"
                  className="fill-slate-200 font-medium pointer-events-none drop-shadow-lg"
                  style={{ fontSize: '11px' }}
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