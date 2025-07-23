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
    }
  }, [setUser, setProfile, setLoading, reset])

  return <>{children}</>
}