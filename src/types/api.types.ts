import type { IBooking, IExperience, ITransaction, IUser } from '@/models'
import type mongoose from 'mongoose'

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Mongoose query builder (replaces `any`)
export type MongooseQuery = Record<string, unknown>

// Populated document types (for lean() results)
export type LeanDocument<T> = Omit<T, keyof mongoose.Document> & {
  _id: string
  createdAt: string
  updatedAt: string
}

// Booking with populated fields
export interface PopulatedBooking extends LeanDocument<IBooking> {
  user?: LeanDocument<IUser>
  experience?: LeanDocument<IExperience>
}

// Experience with populated fields
export interface PopulatedExperience extends LeanDocument<IExperience> {
  destination?: {
    _id: string
    name: string
  }
}

// API request bodies
export interface CreateBookingRequest {
  booking_type: 'transport' | 'experience'
  from_location?: string
  to_location?: string
  experience_id?: string
  scheduled_date: string
  scheduled_time: string
  passenger_count: number
  passengers: Array<{
    name: string
    age: number
    passport?: string
  }>
  selected_addons?: Array<{
    addon_id: string
    quantity: number
  }>
}

export interface CreateTransactionRequest {
  type: 'payment' | 'refund' | 'deposit' | 'withdrawal'
  amount: number
  paymentMethod: 'card' | 'bank' | 'bank_transfer' | 'account_balance' | 'deposit'
  reference?: string
  payment_proof_url?: string
}

// Query filter types
export interface BookingFilters {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  booking_type?: 'transport' | 'experience'
  userId?: string
  startDate?: Date
  endDate?: Date
}

export interface UserFilters {
  role?: 'user' | 'pilot' | 'admin'
  status?: 'active' | 'inactive'
  search?: string
}

export interface ExperienceFilters {
  destination_id?: string
  min_price?: number
  max_price?: number
  search?: string
}

export interface DestinationFilters {
  search?: string
  featured?: boolean
}

// Type guards for runtime type checking
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  )
}

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message
  if (hasMessage(error)) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}
