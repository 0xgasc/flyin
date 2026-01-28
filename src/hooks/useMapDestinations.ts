'use client'

import { useState, useEffect, useCallback } from 'react'

export interface MapDestination {
  id: string
  name: string
  description: string
  location: string
  coordinates: { lat: number; lng: number }
  highlights: string[]
  is_hub: boolean
  airport?: {
    id: string
    code: string
    name: string
    city: string
  } | null
  primary_image_url?: string
}

interface UseMapDestinationsResult {
  destinations: MapDestination[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Static fallback destinations in case API fails
const FALLBACK_DESTINATIONS: MapDestination[] = [
  {
    id: 'guatemala-city',
    name: 'Ciudad de Guatemala',
    description: 'Capital city and main hub. La Aurora International Airport serves as the gateway to Guatemala.',
    location: 'Guatemala',
    coordinates: { lat: 14.6349, lng: -90.5069 },
    highlights: ['International Airport', 'Business Hub', 'Central Location'],
    is_hub: true,
    airport: { id: 'gua', code: 'GUA', name: 'La Aurora International', city: 'Guatemala City' }
  },
  {
    id: 'antigua',
    name: 'Antigua Guatemala',
    description: 'UNESCO World Heritage colonial city surrounded by volcanoes.',
    location: 'Sacatepéquez',
    coordinates: { lat: 14.5586, lng: -90.7295 },
    highlights: ['UNESCO Site', 'Colonial Architecture', 'Volcano Views'],
    is_hub: false
  },
  {
    id: 'lake-atitlan',
    name: 'Lake Atitlán',
    description: 'Stunning volcanic lake surrounded by Mayan villages.',
    location: 'Sololá',
    coordinates: { lat: 14.6989, lng: -91.1867 },
    highlights: ['Scenic Flights', 'Mayan Culture', 'Volcano Backdrop'],
    is_hub: false
  },
  {
    id: 'tikal',
    name: 'Tikal National Park',
    description: 'Ancient Mayan city with towering pyramids rising above the rainforest.',
    location: 'Petén',
    coordinates: { lat: 17.2220, lng: -89.6233 },
    highlights: ['Mayan Pyramids', 'Jungle Wildlife', 'Archaeological Wonder'],
    is_hub: false
  },
  {
    id: 'flores',
    name: 'Flores',
    description: 'Charming island town on Lake Petén Itzá. Gateway to Tikal.',
    location: 'Petén',
    coordinates: { lat: 16.9256, lng: -89.8833 },
    highlights: ['Island Town', 'Tikal Gateway', 'Lake Views'],
    is_hub: false,
    airport: { id: 'frs', code: 'FRS', name: 'Mundo Maya International', city: 'Flores' }
  }
]

export function useMapDestinations(): UseMapDestinationsResult {
  const [destinations, setDestinations] = useState<MapDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/destinations?include_airport=true&include_images=true')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch destinations')
      }

      if (data.success && data.destinations) {
        const mapped: MapDestination[] = data.destinations.map((d: any) => {
          // Find primary image
          const primaryImage = d.destination_images?.find((img: any) => img.is_primary)
          const firstImage = d.destination_images?.[0]

          return {
            id: d.id,
            name: d.name,
            description: d.description,
            location: d.location,
            coordinates: {
              lat: d.coordinates?.lat,
              lng: d.coordinates?.lng
            },
            highlights: d.highlights || [],
            is_hub: d.is_hub || false,
            airport: d.airport || null,
            primary_image_url: primaryImage?.image_url || firstImage?.image_url || undefined
          }
        }).filter((d: MapDestination) =>
          // Filter out destinations without valid coordinates
          d.coordinates.lat && d.coordinates.lng
        )

        setDestinations(mapped.length > 0 ? mapped : FALLBACK_DESTINATIONS)
      } else {
        // No destinations returned, use fallback
        setDestinations(FALLBACK_DESTINATIONS)
      }
    } catch (err: any) {
      console.error('Error fetching map destinations:', err)
      setError(err.message)
      // Use fallback destinations on error
      setDestinations(FALLBACK_DESTINATIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDestinations()
  }, [fetchDestinations])

  return {
    destinations,
    loading,
    error,
    refetch: fetchDestinations
  }
}
