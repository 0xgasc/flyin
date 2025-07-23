import { supabase } from './supabase'

export interface Aircraft {
  id: string
  name: string
  model: string
  type: 'helicopter' | 'airplane'
  capacity: number
  hourly_rate: number
  description: string
  features: string[]
  image_url?: string
  is_available: boolean
}

export interface Destination {
  id: string
  name: string
  code?: string
  city: string
  region?: string
  latitude: number
  longitude: number
  type: 'airport' | 'helipad' | 'tourist_destination' | 'private_airstrip'
  description?: string
  is_active: boolean
}

export interface RoutePrice {
  id: string
  from_destination_id: string
  to_destination_id: string
  aircraft_id: string
  distance_km: number
  flight_time_minutes: number
  base_price: number
  price_per_additional_passenger: number
  from_destination: string
  from_code: string
  to_destination: string
  to_code: string
  aircraft_name: string
  aircraft_model: string
  aircraft_type: string
  aircraft_capacity: number
}

export const fetchAircraft = async (type?: 'helicopter' | 'airplane'): Promise<Aircraft[]> => {
  try {
    let query = supabase
      .from('aircraft')
      .select('*')
      .eq('is_available', true)
      .order('hourly_rate', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching aircraft:', error)
    // Return fallback data
    return [
      {
        id: 'robinson-r44',
        name: 'Robinson R44 II',
        model: 'R44 Raven II',
        type: 'helicopter',
        capacity: 3,
        hourly_rate: 1200,
        description: 'Reliable and cost-effective helicopter for short to medium flights',
        features: ['3 passengers', 'Excellent visibility', 'Cost effective', 'Perfect for tours'],
        is_available: true
      }
    ]
  }
}

export const fetchDestinations = async (type?: string): Promise<Destination[]> => {
  try {
    let query = supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching destinations:', error)
    // Return fallback data
    return [
      {
        id: '1',
        name: 'Guatemala City (La Aurora)',
        code: 'GUA',
        city: 'Guatemala City',
        latitude: 14.5833,
        longitude: -90.5275,
        type: 'airport',
        is_active: true
      }
    ]
  }
}

export const getRoutePrice = async (
  fromCode: string,
  toCode: string,
  aircraftName: string,
  passengerCount: number = 1
): Promise<{
  base_price: number
  additional_passenger_cost: number
  total_price: number
  distance_km: number
  flight_time_minutes: number
} | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_route_price', {
        from_code: fromCode,
        to_code: toCode,
        aircraft_name: aircraftName,
        passenger_count: passengerCount
      })

    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error('Error getting route price:', error)
    return null
  }
}

export const fetchRoutePricing = async (fromCode?: string, toCode?: string): Promise<RoutePrice[]> => {
  try {
    let query = supabase
      .from('route_pricing_view')
      .select('*')

    if (fromCode) {
      query = query.eq('from_code', fromCode)
    }
    if (toCode) {
      query = query.eq('to_code', toCode)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching route pricing:', error)
    return []
  }
}