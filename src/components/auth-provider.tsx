'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setUser, setProfile, setLoading, reset } = useAuthStore()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          reset()
          return
        }

        if (session?.user) {
          setUser(session.user)

          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error('Profile error:', profileError)
              // If profile doesn't exist, create it
              if (profileError.code === 'PGRST116') {
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    role: 'client'
                  })
                  .select()
                  .single()

                if (createError) {
                  console.error('Create profile error:', createError)
                } else {
                  setProfile(newProfile)
                }
              }
            } else if (profile) {
              setProfile(profile)
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError)
          }
        } else {
          reset()
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        reset()
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Set up periodic session validation (every 5 minutes)
    const sessionCheckInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // Check if token is about to expire (within 5 minutes)
          const expiresAt = session.expires_at
          const now = Math.floor(Date.now() / 1000)
          const timeUntilExpiry = expiresAt ? expiresAt - now : 0

          if (timeUntilExpiry < 300) { // Less than 5 minutes
            console.log('Session expiring soon, refreshing in background...')
            const { error } = await supabase.auth.refreshSession()
            if (error) {
              console.warn('Background session refresh failed:', error)
            } else {
              console.log('Session refreshed successfully')
            }
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email)

      if (session?.user) {
        setUser(session.user)

        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setProfile(profile)
          } else if (profileError?.code === 'PGRST116') {
            // Create profile if it doesn't exist
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email || '',
                role: 'client'
              })
              .select()
              .single()

            if (!createError && newProfile) {
              setProfile(newProfile)
            }
          }
        } catch (error) {
          console.error('Auth state change profile error:', error)
        }

        setLoading(false)
      } else {
        reset()
      }
    })

    return () => {
      subscription.unsubscribe()
      clearInterval(sessionCheckInterval)
    }
  }, [setUser, setProfile, setLoading, reset])

  return <>{children}</>
}