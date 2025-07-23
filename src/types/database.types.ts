export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          role: 'client' | 'pilot' | 'admin'
          phone: string | null
          account_balance: number
          kyc_verified: boolean
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          role?: 'client' | 'pilot' | 'admin'
          phone?: string | null
          account_balance?: number
          kyc_verified?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          role?: 'client' | 'pilot' | 'admin'
          phone?: string | null
          account_balance?: number
          kyc_verified?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          client_id: string
          booking_type: 'transport' | 'experience'
          status: 'pending' | 'approved' | 'assigned' | 'completed' | 'cancelled'
          from_location: string | null
          to_location: string | null
          experience_id: string | null
          scheduled_date: string
          scheduled_time: string
          passenger_count: number
          notes: string | null
          total_price: number
          payment_status: 'pending' | 'paid' | 'refunded'
          pilot_id: string | null
          admin_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          client_id: string
          booking_type: 'transport' | 'experience'
          status?: 'pending' | 'approved' | 'assigned' | 'completed' | 'cancelled'
          from_location?: string | null
          to_location?: string | null
          experience_id?: string | null
          scheduled_date: string
          scheduled_time: string
          passenger_count?: number
          notes?: string | null
          total_price: number
          payment_status?: 'pending' | 'paid' | 'refunded'
          pilot_id?: string | null
          admin_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          client_id?: string
          booking_type?: 'transport' | 'experience'
          status?: 'pending' | 'approved' | 'assigned' | 'completed' | 'cancelled'
          from_location?: string | null
          to_location?: string | null
          experience_id?: string | null
          scheduled_date?: string
          scheduled_time?: string
          passenger_count?: number
          notes?: string | null
          total_price?: number
          payment_status?: 'pending' | 'paid' | 'refunded'
          pilot_id?: string | null
          admin_notes?: string | null
        }
      }
      experiences: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          duration_hours: number
          base_price: number
          max_passengers: number
          includes: string[]
          location: string
          image_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          duration_hours: number
          base_price: number
          max_passengers?: number
          includes?: string[]
          location: string
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          duration_hours?: number
          base_price?: number
          max_passengers?: number
          includes?: string[]
          location?: string
          image_url?: string | null
          is_active?: boolean
        }
      }
      airports: {
        Row: {
          id: string
          code: string
          name: string
          city: string
          latitude: number
          longitude: number
          is_custom: boolean
        }
        Insert: {
          id?: string
          code: string
          name: string
          city: string
          latitude: number
          longitude: number
          is_custom?: boolean
        }
        Update: {
          id?: string
          code?: string
          name?: string
          city?: string
          latitude?: number
          longitude?: number
          is_custom?: boolean
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          booking_id: string | null
          type: 'payment' | 'refund' | 'deposit' | 'withdrawal'
          amount: number
          payment_method: 'card' | 'bank' | 'account_balance'
          status: 'pending' | 'completed' | 'failed'
          reference: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          booking_id?: string | null
          type: 'payment' | 'refund' | 'deposit' | 'withdrawal'
          amount: number
          payment_method: 'card' | 'bank' | 'account_balance'
          status?: 'pending' | 'completed' | 'failed'
          reference?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          booking_id?: string | null
          type?: 'payment' | 'refund' | 'deposit' | 'withdrawal'
          amount?: number
          payment_method?: 'card' | 'bank' | 'account_balance'
          status?: 'pending' | 'completed' | 'failed'
          reference?: string | null
        }
      }
    }
  }
}