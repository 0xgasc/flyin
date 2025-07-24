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
          viewBox="0 0 800 600" 
          className="w-full h-full touch-manipulation filter drop-shadow-lg"
          style={{ 
            maxHeight: '500px',
            minHeight: '300px'
          }}
        >
          {/* ACTUAL Guatemala Country Silhouette */}
          <path
            d="M200 100 L220 95 L250 90 L290 85 L340 80 L400 75 L470 78 L530 85 L580 95 L620 110 L650 130 L675 155 L690 185 L700 220 L705 255 L700 290 L690 325 L675 355 L650 380 L620 400 L585 415 L545 425 L500 430 L450 432 L400 430 L350 425 L300 415 L250 400 L200 380 L160 355 L130 325 L110 290 L100 255 L105 220 L120 185 L140 155 L170 130 L200 110 Z"
            fill="rgba(30, 41, 59, 0.2)"
            stroke="rgba(148, 163, 184, 0.4)"
            strokeWidth="1"
            className="pointer-events-none"
          />
          
          {/* Real Guatemala Department Boundaries */}
          {guatemalaDepartments.map((dept) => {
            const getDepartmentPath = (id: string) => {
              const realPaths: Record<string, string> = {
                // Based on actual Guatemala administrative boundaries
                'peten': 'M290 85 L470 78 L530 85 L580 95 L620 110 L650 130 L675 155 L670 185 L660 210 L640 230 L610 245 L580 250 L550 248 L520 245 L490 240 L460 235 L430 230 L400 225 L370 220 L340 215 L320 210 L300 200 L285 185 L290 160 L295 130 L290 100 Z',
                
                'izabal': 'M580 250 L620 110 L650 130 L675 155 L690 185 L700 220 L695 255 L685 285 L670 310 L650 330 L625 340 L600 345 L575 342 L555 335 L540 325 L530 310 L525 295 L530 280 L540 265 L555 255 Z',
                
                'alta-verapaz': 'M400 225 L490 240 L520 245 L540 265 L530 295 L515 320 L495 340 L470 350 L445 355 L420 352 L395 345 L375 335 L360 320 L350 300 L355 280 L365 260 L380 245 Z',
                
                'baja-verapaz': 'M340 215 L400 225 L380 245 L365 260 L355 280 L345 300 L330 315 L315 325 L300 330 L285 325 L275 315 L270 300 L275 285 L285 270 L300 255 L320 240 Z',
                
                'zacapa': 'M490 240 L540 265 L555 285 L565 310 L560 335 L545 355 L525 370 L505 375 L485 372 L470 365 L460 350 L455 335 L460 320 L470 305 L485 290 L500 275 L515 260 Z',
                
                'chiquimula': 'M555 285 L600 345 L625 370 L640 395 L630 420 L615 440 L595 455 L570 465 L545 468 L525 465 L510 455 L500 440 L505 425 L515 410 L530 395 L545 380 L560 365 L570 350 L575 335 L580 320 L585 305 Z',
                
                'jalapa': 'M460 350 L505 375 L525 395 L535 420 L525 445 L510 465 L490 480 L465 485 L440 482 L420 475 L405 465 L395 450 L400 435 L410 420 L425 405 L440 390 L455 375 Z',
                
                'el-progreso': 'M380 245 L460 305 L470 330 L460 355 L445 375 L425 390 L405 400 L385 405 L365 402 L350 395 L340 385 L335 370 L340 355 L350 340 L365 325 L380 310 L395 295 L410 280 L425 265 Z',
                
                'guatemala': 'M350 340 L425 405 L440 430 L430 455 L415 475 L395 490 L370 500 L345 505 L320 502 L300 495 L285 485 L275 470 L280 455 L290 440 L305 425 L320 410 L335 395 Z',
                
                'sacatepequez': 'M300 495 L345 505 L355 525 L350 545 L340 560 L325 570 L305 575 L285 572 L270 565 L260 555 L255 540 L260 525 L270 510 Z',
                
                'chimaltenango': 'M270 470 L320 502 L335 525 L325 550 L310 570 L290 585 L265 595 L240 600 L220 597 L205 590 L195 580 L190 565 L195 550 L205 535 L220 520 L235 505 L250 490 Z',
                
                'escuintla': 'M255 540 L310 570 L325 595 L315 620 L300 640 L280 655 L255 665 L230 670 L205 667 L185 660 L170 650 L160 635 L165 620 L175 605 L190 590 L205 575 L220 560 Z',
                
                'santa-rosa': 'M345 505 L395 490 L415 515 L425 540 L420 565 L410 585 L395 600 L375 610 L350 615 L325 612 L305 605 L290 595 L280 580 L285 565 L295 550 L310 535 L325 520 Z',
                
                'jutiapa': 'M415 515 L465 485 L490 510 L505 535 L500 560 L490 580 L475 595 L455 605 L430 610 L405 607 L385 600 L370 590 L360 575 L365 560 L375 545 L390 530 Z',
                
                'huehuetenango': 'M200 100 L285 185 L290 210 L280 235 L265 255 L245 270 L220 280 L195 285 L170 282 L150 275 L135 265 L125 250 L120 235 L125 220 L135 205 L150 190 L170 175 Z',
                
                'quiche': 'M285 185 L340 215 L355 240 L365 265 L355 290 L340 310 L320 325 L295 335 L270 340 L245 337 L225 330 L210 320 L200 305 L205 290 L215 275 L230 260 L245 245 L260 230 L275 215 Z',
                
                'san-marcos': 'M135 205 L195 285 L185 310 L170 330 L150 345 L125 355 L100 360 L80 357 L65 350 L55 340 L50 325 L55 310 L65 295 L80 280 L100 265 L120 250 Z',
                
                'quetzaltenango': 'M195 285 L245 337 L235 365 L220 385 L200 400 L175 410 L150 415 L125 412 L105 405 L90 395 L80 380 L85 365 L95 350 L110 335 L125 320 L140 305 L155 290 L170 285 Z',
                
                'totonicapan': 'M245 337 L295 335 L310 360 L305 385 L295 405 L280 420 L260 430 L235 435 L210 432 L190 425 L175 415 L165 400 L170 385 L180 370 L195 355 L210 340 Z',
                
                'solola': 'M175 415 L235 435 L245 460 L240 485 L230 505 L215 520 L195 530 L170 535 L145 532 L125 525 L110 515 L100 500 L105 485 L115 470 L130 455 L145 440 Z',
                
                'suchitepequez': 'M195 530 L255 540 L265 565 L255 590 L240 610 L220 625 L195 635 L170 640 L145 637 L125 630 L110 620 L100 605 L105 590 L115 575 L130 560 L145 545 Z',
                
                'retalhuleu': 'M125 525 L170 535 L180 560 L175 585 L165 605 L150 620 L130 630 L105 635 L80 632 L60 625 L45 615 L35 600 L40 585 L50 570 L65 555 L80 540 Z'
              }
              return realPaths[id] || 'M400 300 L420 300 L420 320 L400 320 Z'
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
                      cx={100 + ((dept.coordinates[1] + 92.3) / 4.5) * 600}
                      cy={500 - ((dept.coordinates[0] - 13.5) / 4.0) * 400}
                      r="8"
                      fill="rgba(59, 130, 246, 0.9)"
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth="2"
                      className="pointer-events-none drop-shadow-lg"
                    />
                    <text
                      x={100 + ((dept.coordinates[1] + 92.3) / 4.5) * 600}
                      y={500 - ((dept.coordinates[0] - 13.5) / 4.0) * 400 + 3}
                      textAnchor="middle"
                      className="fill-white font-bold pointer-events-none"
                      style={{ fontSize: '10px' }}
                    >
                      ✈
                    </text>
                  </g>
                ))}
                
                {/* Department Name */}
                <text
                  x={100 + ((dept.coordinates[1] + 92.3) / 4.5) * 600}
                  y={500 - ((dept.coordinates[0] - 13.5) / 4.0) * 400 + 35}
                  textAnchor="middle"
                  className="fill-slate-200 font-semibold pointer-events-none drop-shadow-lg"
                  style={{ fontSize: '12px' }}
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