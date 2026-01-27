'use client'

import { useState, useMemo } from 'react'
import { guatemalaDepartments, type Department } from '@/lib/guatemala-departments'

interface GuatemalaSVGMapProps {
  onDepartmentClick?: (department: Department) => void
  selectedFrom?: string
  selectedTo?: string
  mode?: 'from' | 'to' | 'both'
}

// Guatemala bounding box (approximate)
const BOUNDS = {
  minLat: 13.7,
  maxLat: 17.9,
  minLng: -92.3,
  maxLng: -88.1,
}

// SVG viewport dimensions
const SVG_WIDTH = 400
const SVG_HEIGHT = 450
const PADDING = 30

// Convert lat/lng to SVG coordinates
function projectToSVG(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * (SVG_WIDTH - 2 * PADDING) + PADDING
  // Invert Y because SVG Y increases downward, but latitude increases upward
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * (SVG_HEIGHT - 2 * PADDING) + PADDING
  return { x, y }
}

// Guatemala outline path (simplified)
const GUATEMALA_OUTLINE = `
  M ${projectToSVG(17.8, -91.4).x} ${projectToSVG(17.8, -91.4).y}
  L ${projectToSVG(17.8, -89.1).x} ${projectToSVG(17.8, -89.1).y}
  L ${projectToSVG(16.1, -88.2).x} ${projectToSVG(16.1, -88.2).y}
  L ${projectToSVG(15.9, -88.9).x} ${projectToSVG(15.9, -88.9).y}
  L ${projectToSVG(15.1, -88.6).x} ${projectToSVG(15.1, -88.6).y}
  L ${projectToSVG(14.4, -89.3).x} ${projectToSVG(14.4, -89.3).y}
  L ${projectToSVG(14.2, -89.2).x} ${projectToSVG(14.2, -89.2).y}
  L ${projectToSVG(14.4, -89.6).x} ${projectToSVG(14.4, -89.6).y}
  L ${projectToSVG(14.1, -90.1).x} ${projectToSVG(14.1, -90.1).y}
  L ${projectToSVG(13.8, -90.1).x} ${projectToSVG(13.8, -90.1).y}
  L ${projectToSVG(14.0, -91.4).x} ${projectToSVG(14.0, -91.4).y}
  L ${projectToSVG(14.5, -92.2).x} ${projectToSVG(14.5, -92.2).y}
  L ${projectToSVG(14.9, -92.2).x} ${projectToSVG(14.9, -92.2).y}
  L ${projectToSVG(15.1, -92.1).x} ${projectToSVG(15.1, -92.1).y}
  L ${projectToSVG(15.3, -91.7).x} ${projectToSVG(15.3, -91.7).y}
  L ${projectToSVG(15.8, -91.7).x} ${projectToSVG(15.8, -91.7).y}
  L ${projectToSVG(16.0, -91.0).x} ${projectToSVG(16.0, -91.0).y}
  L ${projectToSVG(17.2, -91.4).x} ${projectToSVG(17.2, -91.4).y}
  Z
`

export default function GuatemalaSVGMap({
  onDepartmentClick,
  selectedFrom,
  selectedTo,
  mode = 'both'
}: GuatemalaSVGMapProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null)

  // Calculate positions for all departments
  const departmentPositions = useMemo(() => {
    return guatemalaDepartments.map(dept => ({
      ...dept,
      pos: projectToSVG(dept.coordinates[0], dept.coordinates[1])
    }))
  }, [])

  // Calculate flight path between selected points
  const flightPath = useMemo(() => {
    if (!selectedFrom || !selectedTo) return null

    const fromDept = departmentPositions.find(d => d.id === selectedFrom)
    const toDept = departmentPositions.find(d => d.id === selectedTo)

    if (!fromDept || !toDept) return null

    // Create curved path for flight
    const startX = fromDept.pos.x
    const startY = fromDept.pos.y
    const endX = toDept.pos.x
    const endY = toDept.pos.y

    // Calculate control point for curve (above the midpoint)
    const midX = (startX + endX) / 2
    const midY = Math.min(startY, endY) - 40

    return {
      path: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`,
      from: fromDept,
      to: toDept
    }
  }, [selectedFrom, selectedTo, departmentPositions])

  const handleDepartmentClick = (dept: Department) => {
    if (onDepartmentClick) {
      onDepartmentClick(dept)
    }
  }

  const getMarkerColor = (deptId: string) => {
    if (deptId === selectedFrom) return '#22c55e' // green
    if (deptId === selectedTo) return '#ef4444' // red
    return '#d4af37' // gold
  }

  const getMarkerSize = (deptId: string) => {
    if (deptId === selectedFrom || deptId === selectedTo) return 10
    if (deptId === hoveredDept) return 8
    return 6
  }

  return (
    <div className="relative w-full">
      <div className="rounded-soft overflow-hidden shadow-luxury border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-luxury-charcoal dark:to-luxury-black">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-96 sm:h-[500px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Definitions for gradients and filters */}
          <defs>
            {/* Background gradient */}
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--card))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgb(var(--card))" stopOpacity="0.4" />
            </linearGradient>

            {/* Guatemala fill gradient */}
            <linearGradient id="guatemalaFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="[stop-color:rgb(var(--primary))]" stopOpacity="0.3" />
              <stop offset="100%" className="[stop-color:rgb(var(--primary))]" stopOpacity="0.15" />
            </linearGradient>

            {/* Gold glow filter */}
            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Flight path animation */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#d4af37" />
            </marker>
          </defs>

          {/* Background */}
          <rect
            x="0"
            y="0"
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            fill="url(#bgGradient)"
          />

          {/* Grid lines for visual interest */}
          <g className="opacity-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * (SVG_HEIGHT / 8)}
                x2={SVG_WIDTH}
                y2={i * (SVG_HEIGHT / 8)}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * (SVG_WIDTH / 8)}
                y1="0"
                x2={i * (SVG_WIDTH / 8)}
                y2={SVG_HEIGHT}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            ))}
          </g>

          {/* Guatemala outline */}
          <path
            d={GUATEMALA_OUTLINE}
            fill="url(#guatemalaFill)"
            stroke="rgb(var(--primary))"
            strokeWidth="2"
            strokeLinejoin="round"
            className="opacity-60"
          />

          {/* Flight path */}
          {flightPath && (
            <g>
              {/* Path shadow */}
              <path
                d={flightPath.path}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="4"
                strokeLinecap="round"
                transform="translate(2, 2)"
              />
              {/* Main path */}
              <path
                d={flightPath.path}
                fill="none"
                stroke="#d4af37"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="8 4"
                markerEnd="url(#arrowhead)"
                className="animate-[dash_2s_linear_infinite]"
              />
              {/* Animated plane/dot along path */}
              <circle r="5" fill="#d4af37" filter="url(#goldGlow)">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={flightPath.path}
                />
              </circle>
            </g>
          )}

          {/* Department markers */}
          {departmentPositions.map((dept) => {
            const isSelected = dept.id === selectedFrom || dept.id === selectedTo
            const isHovered = dept.id === hoveredDept
            const hasAirport = dept.airports.length > 0

            return (
              <g
                key={dept.id}
                onClick={() => handleDepartmentClick(dept)}
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
                className="cursor-pointer transition-transform duration-200"
                style={{ transform: `translate(${dept.pos.x}px, ${dept.pos.y}px)` }}
              >
                {/* Outer ring for airports */}
                {hasAirport && (
                  <circle
                    cx={0}
                    cy={0}
                    r={getMarkerSize(dept.id) + 4}
                    fill="none"
                    stroke={getMarkerColor(dept.id)}
                    strokeWidth="2"
                    opacity={0.5}
                    className={isSelected ? 'animate-pulse' : ''}
                  />
                )}

                {/* Main marker */}
                <circle
                  cx={0}
                  cy={0}
                  r={getMarkerSize(dept.id)}
                  fill={getMarkerColor(dept.id)}
                  stroke="white"
                  strokeWidth="2"
                  filter={isSelected || isHovered ? 'url(#goldGlow)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Label */}
                {(isSelected || isHovered) && (
                  <g>
                    {/* Label background */}
                    <rect
                      x={12}
                      y={-10}
                      width={dept.name.length * 7 + 10}
                      height={20}
                      rx={4}
                      fill="rgb(var(--card))"
                      stroke="rgb(var(--border))"
                      strokeWidth="1"
                      className="drop-shadow-md"
                    />
                    {/* Label text */}
                    <text
                      x={17}
                      y={4}
                      fontSize="12"
                      fontWeight="500"
                      fill="rgb(var(--foreground))"
                      className="font-sans"
                    >
                      {dept.name}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(${SVG_WIDTH - 100}, ${SVG_HEIGHT - 80})`}>
            <rect
              x={-10}
              y={-10}
              width={100}
              height={70}
              rx={4}
              fill="rgb(var(--card))"
              fillOpacity="0.9"
              stroke="rgb(var(--border))"
              strokeWidth="1"
            />
            <g transform="translate(0, 5)">
              <circle cx={0} cy={0} r={4} fill="#22c55e" />
              <text x={10} y={4} fontSize="10" fill="rgb(var(--foreground))">From</text>
            </g>
            <g transform="translate(0, 22)">
              <circle cx={0} cy={0} r={4} fill="#ef4444" />
              <text x={10} y={4} fontSize="10" fill="rgb(var(--foreground))">To</text>
            </g>
            <g transform="translate(0, 39)">
              <circle cx={0} cy={0} r={4} fill="#d4af37" />
              <circle cx={0} cy={0} r={7} fill="none" stroke="#d4af37" strokeWidth="1" />
              <text x={10} y={4} fontSize="10" fill="rgb(var(--foreground))">Airport</text>
            </g>
          </g>

          {/* Title */}
          <text
            x={PADDING}
            y={25}
            fontSize="16"
            fontWeight="600"
            fill="rgb(var(--foreground))"
            className="font-display"
          >
            Guatemala
          </text>
          <text
            x={PADDING}
            y={42}
            fontSize="10"
            fill="rgb(var(--muted-foreground))"
          >
            Click destinations to select route
          </text>
        </svg>

        {/* Hover tooltip outside SVG for better styling */}
        {hoveredDept && (() => {
          const dept = departmentPositions.find(d => d.id === hoveredDept)
          if (!dept) return null
          return (
            <div
              className="absolute pointer-events-none bg-white dark:bg-luxury-charcoal rounded-soft shadow-luxury border border-gray-200 dark:border-gray-700 p-3 text-sm max-w-[200px] z-10"
              style={{
                left: `${(dept.pos.x / SVG_WIDTH) * 100}%`,
                top: `${(dept.pos.y / SVG_HEIGHT) * 100}%`,
                transform: 'translate(20px, -50%)'
              }}
            >
              <div className="font-semibold text-gray-900 dark:text-white">{dept.name}</div>
              {dept.airports.length > 0 && (
                <div className="text-xs text-gold-600 dark:text-gold-400 mt-1">
                  ✈ {dept.airports.map(a => a.code).join(', ')}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {dept.destinations.slice(0, 3).join(', ')}
                {dept.destinations.length > 3 && '...'}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Selection summary below map */}
      {(selectedFrom || selectedTo) && (
        <div className="mt-4 p-4 bg-white dark:bg-luxury-charcoal rounded-soft border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                From: {selectedFrom ? departmentPositions.find(d => d.id === selectedFrom)?.name || selectedFrom : 'Select origin'}
              </span>
            </div>
            <div className="text-gold-500 dark:text-gold-400">→</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                To: {selectedTo ? departmentPositions.find(d => d.id === selectedTo)?.name || selectedTo : 'Select destination'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
