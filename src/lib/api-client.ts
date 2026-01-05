// API client for MongoDB backend

import { getAuthHeaders } from './auth-client'

const API_BASE = '/api'

// Generic fetch with auth
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers
      }
    })

    const json = await res.json()

    if (!res.ok) {
      return { error: json.error || 'Request failed' }
    }

    return { data: json }
  } catch (error: any) {
    return { error: error.message || 'Network error' }
  }
}

// Bookings
export const bookings = {
  list: (params?: { status?: string; type?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.type) searchParams.set('type', params.type)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    const query = searchParams.toString()
    return authFetch(`/bookings${query ? `?${query}` : ''}`)
  },

  get: (id: string) => authFetch(`/bookings/${id}`),

  create: (data: {
    booking_type: 'transport' | 'experience'
    from_location?: string
    to_location?: string
    experience_id?: string
    scheduled_date: string
    scheduled_time: string
    passenger_count?: number
    notes?: string
    total_price: number
  }) => authFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  update: (id: string, data: {
    status?: string
    notes?: string
    admin_notes?: string
    pilot_id?: string
    payment_status?: string
  }) => authFetch(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  cancel: (id: string) => authFetch(`/bookings/${id}`, {
    method: 'DELETE'
  })
}

// Experiences
export const experiences = {
  list: (includeInactive = false) =>
    authFetch(`/experiences${includeInactive ? '?include_inactive=true' : ''}`),

  create: (data: {
    name: string
    description: string
    duration_hours: number
    base_price: number
    max_passengers?: number
    includes?: string[]
    location: string
    image_url?: string
  }) => authFetch('/experiences', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Airports
export const airports = {
  list: () => authFetch('/airports'),

  create: (data: {
    code: string
    name: string
    city: string
    latitude: number
    longitude: number
    is_custom?: boolean
  }) => authFetch('/airports', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// User balance
export const balance = {
  get: () => authFetch('/user/balance'),

  deposit: (data: {
    amount: number
    payment_method: 'card' | 'bank'
    reference?: string
  }) => authFetch('/user/balance', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
