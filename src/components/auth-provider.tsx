'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { getCurrentUser } from '@/lib/auth-client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, reset } = useAuthStore()
  const lastCheckRef = useRef<number>(0)

  const checkUser = useCallback(async (force = false) => {
    // Skip if checked recently (within 2 minutes) unless forced
    const now = Date.now()
    if (!force && now - lastCheckRef.current < 2 * 60 * 1000) {
      return
    }
    lastCheckRef.current = now

    try {
      const user = await getCurrentUser()

      if (user) {
        setUser(user)
        setProfile(user) // In MongoDB, user and profile are the same
      } else {
        reset()
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      reset()
    } finally {
      setLoading(false)
    }
  }, [setUser, setProfile, setLoading, reset])

  useEffect(() => {
    checkUser(true) // Force initial check

    // Set up periodic session validation (every 15 minutes instead of 5)
    // Only checks when tab is visible to reduce unnecessary API calls
    const sessionCheckInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkUser()
      }
    }, 15 * 60 * 1000)

    // Check when tab becomes visible (if it's been a while)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUser() // Will skip if checked recently
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Listen for storage events (token changes from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token') {
        checkUser(true) // Force check on token change
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(sessionCheckInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [checkUser])

  return <>{children}</>
}