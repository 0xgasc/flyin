import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
  hardReset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      reset: () => set({ user: null, profile: null, loading: false }),
      hardReset: () => {
        // Clear persisted state
        localStorage.removeItem('auth-store')
        sessionStorage.removeItem('auth-store')
        set({ user: null, profile: null, loading: false })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: null, // Don't persist user to avoid stale auth
        profile: null, // Don't persist profile either
        loading: state.loading 
      }),
    }
  )
)