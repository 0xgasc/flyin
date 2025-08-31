'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'

export default function AdminBypassPage() {
  const router = useRouter()
  
  useEffect(() => {
    const setupBypass = async () => {
      console.log('🔐 Setting up admin bypass...')
      
      // Force clear everything first
      const { hardReset } = useAuthStore.getState()
      hardReset()
      
      // Clear all Supabase tokens
      const keys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      )
      keys.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      
      console.log('✅ All auth cleared, redirecting to login...')
      
      // Redirect to login with a clean slate
      setTimeout(() => {
        router.push('/login?fresh=true')
      }, 1000)
    }
    
    setupBypass()
  }, [router])
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold mb-4">Admin Bypass Reset</h1>
        <p>Clearing all authentication data...</p>
        <p className="mt-4 text-sm opacity-75">Redirecting to login page...</p>
      </div>
    </div>
  )
}