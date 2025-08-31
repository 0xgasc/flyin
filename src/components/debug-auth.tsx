'use client'

import { useAuthStore } from '@/lib/auth-store'
import { supabase } from '@/lib/supabase'

export function DebugAuth() {
  const { user, profile, loading } = useAuthStore()
  
  const handleForceSignOut = async () => {
    console.log('Force signing out...')
    await supabase.auth.signOut()
    const { hardReset } = useAuthStore.getState()
    hardReset()
    window.location.reload()
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded text-xs max-w-xs z-50">
      <div className="font-bold">Auth Debug:</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user?.email || 'None'}</div>
      <div>Profile: {profile?.role || 'None'}</div>
      <button 
        onClick={handleForceSignOut}
        className="mt-2 px-2 py-1 bg-red-600 rounded text-xs"
      >
        Force Sign Out
      </button>
    </div>
  )
}