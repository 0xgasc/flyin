import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️  Supabase environment variables not set. Please update .env.local with your Supabase credentials.')
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'sb-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Add session refresh helper
export const refreshSession = async () => {
  try {
    const { error } = await supabase.auth.refreshSession()
    if (error) {
      console.warn('Session refresh failed:', error)
      return false
    }
    return true
  } catch (error) {
    console.warn('Session refresh error:', error)
    return false
  }
}

// Add authenticated request wrapper
export const authenticatedRequest = async (requestFn: () => Promise<any>) => {
  try {
    const result = await requestFn()
    
    // Check if request failed due to auth
    if (result.error?.message?.includes('JWT') || result.error?.message?.includes('auth')) {
      console.log('Auth error detected, attempting to refresh session...')
      const refreshed = await refreshSession()
      
      if (refreshed) {
        // Retry the request
        return await requestFn()
      } else {
        // Redirect to login
        window.location.href = '/login'
        return result
      }
    }
    
    return result
  } catch (error) {
    console.error('Authenticated request error:', error)
    throw error
  }
}