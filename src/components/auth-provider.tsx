'use client'

import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { getCurrentUser } from '@/lib/auth-client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, reset } = useAuthStore()

  const checkUser = useCallback(async () => {
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
    checkUser()

    // Set up periodic session validation (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      checkUser()
    }, 5 * 60 * 1000)

    // Listen for storage events (token changes from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token') {
        checkUser()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(sessionCheckInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [checkUser])

  return <>{children}</>
}