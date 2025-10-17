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
    storageKey: 'sb-boruptqklkvrmexxgwmc-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
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

// Check if session is valid and not expired
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.warn('Session validation error:', error)
      return { valid: false, session: null }
    }

    if (!session) {
      console.warn('No active session found')
      return { valid: false, session: null }
    }

    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = expiresAt ? expiresAt - now : 0

    if (timeUntilExpiry < 300) { // Less than 5 minutes
      console.log('Session expiring soon, refreshing...')
      const refreshed = await refreshSession()
      if (!refreshed) {
        return { valid: false, session: null }
      }
      // Get the new session after refresh
      const { data: { session: newSession } } = await supabase.auth.getSession()
      return { valid: true, session: newSession }
    }

    return { valid: true, session }
  } catch (error) {
    console.error('Session validation error:', error)
    return { valid: false, session: null }
  }
}

// Add authenticated request wrapper with session validation
export const authenticatedRequest = async <T = any>(
  requestFn: () => Promise<T>,
  options?: { redirectOnFail?: boolean }
): Promise<T> => {
  const { redirectOnFail = true } = options || {}

  try {
    // Validate session before making request
    const { valid, session } = await validateSession()

    if (!valid || !session) {
      console.warn('Invalid session, redirecting to login...')
      if (redirectOnFail && typeof window !== 'undefined') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      }
      throw new Error('Session expired or invalid')
    }

    // Make the request
    const result = await requestFn()

    // Check if request failed due to auth issues
    if (result && typeof result === 'object' && 'error' in result) {
      const error = (result as any).error
      if (error?.message?.includes('JWT') ||
          error?.message?.includes('auth') ||
          error?.code === 'PGRST301') {
        console.log('Auth error detected, attempting to refresh session...')
        const refreshed = await refreshSession()

        if (refreshed) {
          // Retry the request with fresh session
          console.log('Session refreshed, retrying request...')
          return await requestFn()
        } else {
          // Redirect to login
          console.warn('Session refresh failed, redirecting to login...')
          if (redirectOnFail && typeof window !== 'undefined') {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
          }
          throw new Error('Session refresh failed')
        }
      }
    }

    return result
  } catch (error) {
    console.error('Authenticated request error:', error)
    throw error
  }
}