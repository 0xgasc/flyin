// Shared types for admin dashboard components

export interface Booking {
  id: string
  created_at: string
  booking_type: 'transport' | 'experience'
  status: string
  from_location: string | null
  to_location: string | null
  scheduled_date: string
  scheduled_time: string
  passenger_count: number
  total_price: number
  notes: string | null
  admin_notes: string | null
  payment_status: string
  pilot_id: string | null
  client: {
    id: string
    full_name: string | null
    email: string
    phone: string | null
  }
  pilot: {
    id: string
    full_name: string | null
    email: string
  } | null
  experiences: {
    name: string
    location: string
  } | null
  passenger_details?: any[]
  selected_addons?: any[]
  addon_total_price?: number
  helicopter_id?: string | null
  return_date?: string | null
  return_time?: string | null
  is_round_trip?: boolean
  revision_requested?: boolean
  revision_notes?: string | null
  revision_data?: any
}

export interface Pilot {
  id: string
  full_name: string | null
  email: string
  kyc_verified: boolean
}

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'client' | 'pilot' | 'admin'
  account_balance: number
  created_at: string
  kyc_verified?: boolean
}

export interface Transaction {
  id: string
  created_at: string
  user_id: string
  type: 'payment' | 'refund' | 'deposit' | 'withdrawal'
  amount: number
  payment_method: string
  reference: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'
  payment_proof_url?: string | null
  processed_at?: string | null
  admin_notes?: string | null
  user?: {
    full_name: string | null
    email: string
  }
}

export interface Experience {
  id: string
  name: string
  name_es: string | null
  description: string
  description_es: string | null
  duration_hours: number
  duration_minutes: number | null
  base_price: number
  max_passengers: number
  min_passengers: number
  includes: string[]
  includes_es: string[] | null
  location: string
  is_active: boolean
  order_index: number | null
  image_url: string | null
}

export interface Destination {
  id: string
  name: string
  description: string
  location: string
  coordinates: { lat: number; lng: number }
  features: string[]
  is_active: boolean
  order_index: number | null
}

export interface ExperienceImage {
  id: string
  experience_id: string
  image_url: string
  caption: string | null
  is_primary: boolean
  order_index: number
}

export interface DestinationImage {
  id: string
  destination_id: string
  image_url: string
  caption: string | null
  is_primary: boolean
  order_index: number
}

export interface PilotCertification {
  id: string
  pilot_id: string
  pilot: {
    id: string
    full_name: string | null
    email: string
  } | null
  helicopter_id: string
  helicopter: {
    id: string
    name: string
    model: string
    registration_number: string
  } | null
  certified_since: string
  flight_hours: number
  status: 'active' | 'expired' | 'suspended'
  notes: string | null
}

export type AdminTab = 'bookings' | 'calendar' | 'users' | 'pilots' | 'transactions' | 'aircrafts' | 'analytics' | 'experiences' | 'destinations' | 'addons'
