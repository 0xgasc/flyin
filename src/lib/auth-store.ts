import { create } from 'zustand'
import { User } from '@/lib/auth-client'

// Profile type now mirrors User (MongoDB doesn't separate auth user and profile)
type Profile = User

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

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, profile: null, loading: false }),
  hardReset: () => {
    // Clear all possible stored state
    localStorage.clear()
    sessionStorage.clear()
    // Clear IndexedDB if present
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('keyval-store')
    }
    set({ user: null, profile: null, loading: false })
    // Force reload
    window.location.reload()
  },
}))